import { useBackendStatus } from "@/lib/backendStatus";
import { CloudSlash } from "@phosphor-icons/react";

/**
 * Slim global banner shown while the Supabase backend is unreachable: the
 * community features (comments, photos, likes) are unavailable, everything
 * local (map, schedule, archive) keeps working. See T1.1 in PLAN.md.
 */
export function CommunityOfflineBanner() {
  const status = useBackendStatus();
  if (status !== "offline") return null;

  return (
    <div
      role="status"
      className="w-full bg-falla-fire/10 border-b-2 border-falla-fire/30 text-falla-ink mt-[76px] md:mt-[124px]"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-center">
        <CloudSlash size={18} weight="bold" className="text-falla-fire shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] leading-relaxed">
          Community features offline — comments, photos &amp; likes are
          unavailable right now. Map &amp; schedule still work.
        </p>
      </div>
    </div>
  );
}
