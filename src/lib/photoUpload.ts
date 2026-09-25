// Shared client-side photo pipeline for community uploads (monument/hub drawer
// in FallaDetails, event hub in SchedulePage): file validation, safe storage
// paths, and delete-on-failure cleanup when the DB row insert fails.
//
// Storage ops are injected (PhotoStorageLike) so this module has no Supabase
// import and the pipeline is directly testable outside the app.

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/jpg", // non-standard but common on Windows uploads
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** accept= attribute matching ALLOWED_PHOTO_TYPES, for the file inputs. */
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

/**
 * Returns a user-facing error message when the file is not an acceptable
 * photo, or null when it is valid.
 */
export function validatePhotoFile(file: File): string | null {
  const type = (file.type || "").toLowerCase();
  const ext = file.name.includes(".")
    ? (file.name.split(".").pop() ?? "").toLowerCase()
    : "";
  const typeOk =
    ALLOWED_PHOTO_TYPES.has(type) || (type === "" && ALLOWED_EXTENSIONS.has(ext));
  if (!typeOk) {
    return "Unsupported file type — please choose a JPEG, PNG, WebP, GIF or AVIF image.";
  }
  if (file.size === 0) {
    return "That file is empty — please choose another photo.";
  }
  if (file.size > MAX_PHOTO_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Photo is ${mb}MB — the limit is 10MB. Please choose a smaller file.`;
  }
  return null;
}

function safeExtension(file: File): string {
  const ext = file.name.includes(".")
    ? (file.name.split(".").pop() ?? "").toLowerCase()
    : "";
  if (ALLOWED_EXTENSIONS.has(ext)) return ext;
  return EXT_BY_TYPE[(file.type || "").toLowerCase()] ?? "jpg";
}

/** Minimal structural view of supabase.storage for the ops this pipeline needs. */
export interface PhotoStorageLike {
  from(bucket: string): {
    upload(
      path: string,
      file: File
    ): PromiseLike<{ error: { message?: string } | null }>;
    remove(paths: string[]): PromiseLike<{ error: unknown }>;
    getPublicUrl(path: string): { data: { publicUrl: string } };
  };
}

export interface UploadCommunityPhotoOptions {
  /** Storage folder, e.g. "falla-images" / "event-images". */
  folder: string;
  /** Prefix for the stored filename (sanitised to [a-zA-Z0-9_-]). */
  namePrefix: string;
  storage: PhotoStorageLike;
  /** Inserts the DB row; resolve with { error } on failure (e.g. addImage). */
  saveRow: (publicUrl: string) => PromiseLike<{ error: unknown }>;
  bucket?: string;
}

export type UploadPhotoResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

/**
 * Validate → upload to storage → save the DB row. If the row fails to save,
 * the uploaded storage object is removed (best effort) so no orphan is left
 * behind. Never throws: every failure comes back as { ok: false, message }.
 */
export async function uploadCommunityPhoto(
  file: File,
  opts: UploadCommunityPhotoOptions
): Promise<UploadPhotoResult> {
  try {
    const invalid = validatePhotoFile(file);
    if (invalid) return { ok: false, message: invalid };

    const bucket = opts.bucket ?? "community-content";
    const safePrefix =
      opts.namePrefix.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") ||
      "photo";
    const path = `${opts.folder}/${safePrefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${safeExtension(file)}`;

    const { error: uploadError } = await opts.storage.from(bucket).upload(path, file);
    if (uploadError) {
      return {
        ok: false,
        message: uploadError.message
          ? `Upload failed — ${uploadError.message}`
          : "Upload failed — please try again.",
      };
    }

    const {
      data: { publicUrl },
    } = opts.storage.from(bucket).getPublicUrl(path);

    // saveRow may resolve with { error } or throw (network) — either way the row
    // didn't land and the stored object must be cleaned up.
    let saveFailed = false;
    try {
      const { error: saveError } = await opts.saveRow(publicUrl);
      saveFailed = !!saveError;
    } catch {
      saveFailed = true;
    }
    if (saveFailed) {
      // Best-effort removal of the orphaned storage object.
      try {
        await opts.storage.from(bucket).remove([path]);
      } catch {
        /* cleanup is best effort */
      }
      return { ok: false, message: "Couldn't save the photo — please try again." };
    }

    return { ok: true, url: publicUrl };
  } catch {
    return { ok: false, message: "Upload failed — please try again." };
  }
}
