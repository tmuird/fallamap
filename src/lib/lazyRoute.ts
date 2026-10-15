import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { isChunkLoadError, markRecoveryAttempt, shouldAttemptRecovery } from "./bootGuard";

/**
 * `React.lazy` with recovery. A failed dynamic import is cached by React for the rest of the
 * session, so one dropped request left a route permanently showing an error — observed: the
 * sign-in chunk aborted once, and after the network recovered the page still refused to load.
 *
 * A chunk failure almost always means the tab is holding an older `index.html` than the one
 * the server is serving, so a single reload fixes it. Guarded per route per session, so a
 * genuinely broken build cannot become a reload loop.
 */
export function lazyRoute<T extends ComponentType<Record<string, unknown>>>(
  load: () => Promise<{ default: T }>,
  routeName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await load();
    } catch (error) {
      if (isChunkLoadError(error)) {
        const storage = typeof sessionStorage === "undefined" ? null : sessionStorage;
        if (!storage || shouldAttemptRecovery(routeName, storage)) {
          if (storage) markRecoveryAttempt(routeName, storage);
          window.location.reload();
          // Stay pending for the few milliseconds the reload takes, rather than flashing the
          // error screen on a page that is about to be replaced anyway.
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}
