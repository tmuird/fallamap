/**
 * Clerk auth steps render only while a sign-in/sign-up attempt is in progress.
 * A direct visit to one of Clerk's own subroutes (a stale verification link, a
 * bookmarked URL, a back-button return after the attempt was dropped) therefore
 * renders the shell with an empty form area — which reads as a blank page.
 *
 * These helpers name that case so the pages can offer a branded recovery panel
 * instead of empty space.
 */

const AUTH_ROOT = /^\/sign-(in|up)\/?$/;
const AUTH_ANY = /^\/sign-(in|up)(\/.*)?$/;

/** True only for a nested Clerk step such as `/sign-in/reset-password`. */
export function isAuthSubroute(pathname: string): boolean {
  return AUTH_ANY.test(pathname) && !AUTH_ROOT.test(pathname);
}

/** Selector for any container Clerk renders a step into. */
export const CLERK_STEP_SELECTOR = ".cl-card, .cl-form, form";

/** Grace period: long enough for Clerk's client to render a real step. */
export const AUTH_STEP_RENDER_GRACE_MS = 1800;

export function shouldOfferAuthStepRecovery(
  isSubroute: boolean,
  hasRenderedStep: boolean
): boolean {
  return isSubroute && !hasRenderedStep;
}
