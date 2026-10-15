/**
 * The first thing in the tab order, before the navbar.
 *
 * Without it a keyboard user has to walk the logo, five nav links, the theme toggle and the
 * account controls on *every* route before reaching the page they asked for — six focus stops
 * of chrome, on nine routes. Hidden until focused, then painted as a real button so it is
 * obvious what just happened. `#main-content` carries `tabindex="-1"` and a
 * `scroll-margin-top` of `--content-top`, so focus lands at the top of the content and
 * nothing is hidden under the fixed navbar.
 */
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:inline-flex focus:items-center focus:min-h-[44px] focus:px-5 focus:rounded-2xl focus:bg-falla-fire focus:text-falla-on-fire focus:font-black focus:uppercase focus:tracking-widest focus:text-xs focus:no-underline"
    >
      Skip to content
    </a>
  );
}
