import { useEffect, useRef } from "react";
import { useBackendStatus } from "@/lib/backendStatus";
import { CloudSlash } from "@phosphor-icons/react";

/**
 * Slim global banner shown while the Supabase backend is unreachable: the
 * community features (comments, photos, likes) are unavailable, everything
 * local (map, schedule, archive) keeps working. See T1.1 in PLAN.md.
 *
 * While it is on screen it publishes its own bottom edge as `--content-top`, which is what
 * full-bleed pages use to start below it: the map is `position: fixed`, so without this the
 * map layer painted straight over the banner on phones and its message was unreadable.
 */
export function CommunityOfflineBanner() {
  const status = useBackendStatus();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (status !== "offline") {
      root.style.removeProperty("--content-top");
      return;
    }

    const publish = () => {
      const bottom = bannerRef.current?.getBoundingClientRect().bottom ?? 0;
      if (bottom > 0) root.style.setProperty("--content-top", `${Math.round(bottom)}px`);
    };

    publish();
    window.addEventListener("resize", publish);
    const observer = new ResizeObserver(publish);
    if (bannerRef.current) observer.observe(bannerRef.current);

    return () => {
      window.removeEventListener("resize", publish);
      observer.disconnect();
      root.style.removeProperty("--content-top");
    };
  }, [status]);

  if (status !== "offline") return null;

  return (
    <div
      ref={bannerRef}
      role="status"
      className="w-full bg-falla-fire/10 border-b-2 border-falla-fire/30 text-falla-ink mt-[76px] md:mt-[124px]"
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
