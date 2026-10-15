import { useEffect, useRef } from "react";
import { useBackendStatus } from "@/lib/backendStatus";
import { CloudSlash } from "@phosphor-icons/react";

/**
 * Slim global banner shown while the Supabase backend is unreachable: the
 * community features (comments, photos, likes) are unavailable, everything
 * local (map, schedule, archive) keeps working. See T1.1 in PLAN.md.
 *
 * It sits in normal flow directly under the navbar (`margin-top: var(--nav-h)`) and publishes
 * its own height as `--banner-h`, which `--content-top` adds to `--nav-h`. Everything
 * chrome-aware — the map's fixed layer, page frames, sticky bars — reads `--content-top`, so
 * the layout is correct whether this banner is up or not, and nothing can be painted over.
 */
export function CommunityOfflineBanner() {
  const status = useBackendStatus();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (status !== "offline") {
      root.style.removeProperty("--banner-h");
      return;
    }

    const publish = () => {
      const height = bannerRef.current?.getBoundingClientRect().height ?? 0;
      if (height > 0) root.style.setProperty("--banner-h", `${Math.round(height)}px`);
    };

    publish();
    window.addEventListener("resize", publish);
    const observer = new ResizeObserver(publish);
    if (bannerRef.current) observer.observe(bannerRef.current);

    return () => {
      window.removeEventListener("resize", publish);
      observer.disconnect();
      root.style.removeProperty("--banner-h");
    };
  }, [status]);

  if (status !== "offline") return null;

  return (
    <div
      ref={bannerRef}
      role="status"
      className="w-full bg-falla-fire/10 border-b-2 border-falla-fire/30 text-falla-ink mt-[var(--nav-h)]"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-center">
        <CloudSlash size={18} weight="bold" className="text-falla-fire-ink shrink-0" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] leading-relaxed">
          Community features offline — comments, photos &amp; likes are
          unavailable right now. Map &amp; schedule still work.
        </p>
      </div>
    </div>
  );
}
