export interface NavbarScrollState {
  lastY: number;
  pendingDelta: number;
  visible: boolean;
}

export const NAVBAR_SCROLL_THRESHOLD = 100;
export const NAVBAR_DIRECTION_HYSTERESIS = 12;

export function createNavbarScrollState(scrollY = 0): NavbarScrollState {
  return { lastY: scrollY, pendingDelta: 0, visible: true };
}

/** Accumulate directional movement so trackpad/touch jitter cannot toggle the navbar. */
export function advanceNavbarScrollState(
  state: NavbarScrollState,
  scrollY: number,
  menuOpen = false
): NavbarScrollState {
  if (scrollY < 10 || menuOpen) {
    return { lastY: scrollY, pendingDelta: 0, visible: true };
  }

  const pendingDelta = state.pendingDelta + scrollY - state.lastY;
  if (Math.abs(pendingDelta) < NAVBAR_DIRECTION_HYSTERESIS) {
    return { ...state, lastY: scrollY, pendingDelta };
  }

  return {
    lastY: scrollY,
    pendingDelta: 0,
    visible: pendingDelta < 0 || scrollY < NAVBAR_SCROLL_THRESHOLD,
  };
}
