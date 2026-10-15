/**
 * Boot-time resilience. The app used to render NOTHING when Clerk's script could not be
 * fetched (a flaky CDN, an ad-blocker, a corporate proxy): `#root` came back empty with no
 * page error, so the page looked blank and clicking Sign in / Join did nothing until the
 * user refreshed. These helpers keep the failure explainable and recoverable.
 */

/** How long the boot screen waits before admitting something is wrong and offering a retry. */
export const BOOT_SLOW_MS = 8000;

/** Namespace for the once-per-session recovery flags. */
export const RECOVERY_KEY = "fallamap:boot-recovery";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

/**
 * True for a failed dynamic `import()` — the browser wordings plus webpack's ChunkLoadError.
 * Almost always a stale build (the chunk hash changed under a tab that is still open) or a
 * dropped request, so the cures are "reload" and "retry", never "your input was wrong".
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name}: ${error.message}`;
  return [
    /failed to fetch dynamically imported module/i,
    /error loading dynamically imported module/i,
    /importing a module script failed/i,
    /chunkloaderror/i,
    /loading chunk \d+ failed/i,
  ].some((pattern) => pattern.test(message));
}

export function recoveryKeyFor(routeName: string): string {
  return `${RECOVERY_KEY}:${routeName}`;
}

/**
 * Whether this route may trigger a one-shot reload. Guarded per route per session so a build
 * that is genuinely broken cannot put the browser in a reload loop; a storage that throws
 * (private mode, blocked cookies) still gets the reload, because failing open is better than
 * a blank page.
 */
export function shouldAttemptRecovery(routeName: string, storage: StorageLike): boolean {
  try {
    return storage.getItem(recoveryKeyFor(routeName)) !== "1";
  } catch {
    return true;
  }
}

export function markRecoveryAttempt(routeName: string, storage: StorageLike): void {
  try {
    storage.setItem(recoveryKeyFor(routeName), "1");
  } catch {
    /* nothing to record — the reload still helps */
  }
}

export interface BootFailureCopy {
  isChunk: boolean;
  canRetry: boolean;
  title: string;
  body: string;
}

export function describeBootFailure(error: unknown): BootFailureCopy {
  if (isChunkLoadError(error)) {
    return {
      isChunk: true,
      canRetry: true,
      title: "This page is out of date",
      body: "A newer version of the site is available, or the page didn't finish downloading. Reload to pick it up — your saved events are kept on this device.",
    };
  }
  return {
    isChunk: false,
    canRetry: true,
    title: "This page didn't start",
    body: "Something stopped the page from starting up. Reloading usually clears it — your saved events are kept on this device.",
  };
}

export interface BootStatusCopy {
  title: string;
  body: string;
  showRetry: boolean;
}

/**
 * Copy for the covering boot screen. Before the threshold it just says it is working; past
 * it the user gets a retry, because a screen that never changes is indistinguishable from a
 * broken one.
 */
export function bootStatusCopy(elapsedMs: number): BootStatusCopy {
  const elapsed = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  if (elapsed >= BOOT_SLOW_MS) {
    return {
      title: "Still starting up",
      body: "Loading the sign-in service is taking longer than usual — it may be blocked on this network. You can keep waiting, or reload to try again.",
      showRetry: true,
    };
  }
  return {
    title: "Starting up",
    body: "Getting things ready…",
    showRetry: false,
  };
}
