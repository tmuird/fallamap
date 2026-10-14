#!/usr/bin/env node
/**
 * npm run audit:ui — objective layout/legibility audit of the running app.
 *
 * "The element exists in the DOM" is not the same as "a person can read it".
 * This drives a real browser and reports the defects that DOM-presence checks miss:
 *
 *   1. content clipped  — text cut off inside an overflow:hidden box
 *   2. overlapping      — elements painted on top of each other (clipping-aware,
 *                         and confirmed with elementFromPoint so a hidden-but-present
 *                         node is not reported as a collision)
 *   3. low contrast     — text below WCAG AA (4.5:1, or 3:1 for large text) against
 *                         its effective background
 *   4. overflow         — horizontal scrolling introduced by a child
 *
 * Usage:
 *   npm run audit:ui                                  # against http://127.0.0.1:4173
 *   npm run audit:ui -- --base=http://127.0.0.1:5173  # against the dev server
 *   npm run audit:ui -- --routes=/sign-in,/schedule --json
 *
 * Exit code is 1 when any route reports a defect, so it can gate a change.
 */
import { chromium } from "playwright";

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const BASE = arg("base", "http://127.0.0.1:4173").replace(/\/$/, "");
const ROUTES = arg("routes", "/,/map,/schedule,/archive,/contact,/profile,/sign-in,/sign-up,/dashboard").split(",");
const AS_JSON = args.includes("--json");
const WIDTHS = arg("widths", "1440,768,390").split(",").map(Number);
// Dark mode is `darkMode: "class"` driven by localStorage.theme, so it has to be seeded
// before the app boots. Contrast is measured against the *effective* background either way.
const THEMES = arg("themes", "light,dark").split(",");
const SETTLE_MS = Number(arg("settle", 3500));

/** Runs inside the page. Keep it dependency-free. */
function auditPage() {
  const SKIP_SELECTOR = "script,style,noscript,canvas,[aria-hidden='true'],.mapboxgl-map,[data-audit-skip]";
  const GLYPH = /[A-Za-z0-9]/;

  const describe = (el) => {
    const cls =
      typeof el.className === "string"
        ? el.className
            .split(/\s+/)
            .filter((c) => c && !c.startsWith("!") && !/^(w-|h-|p-|m-|text-|font-|border-|bg-|rounded|flex|grid)/.test(c))
            .slice(0, 2)
            .join(".")
        : "";
    const label = (el.getAttribute("aria-label") || el.innerText || el.placeholder || el.value || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 32);
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${label ? `:"${label}"` : ""}`;
  };

  const rectOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };

  /** The rect that is actually painted: the element's box clipped by every clipping ancestor. */
  const paintedRect = (el) => {
    const r = el.getBoundingClientRect();
    let top = r.top,
      left = r.left,
      bottom = r.bottom,
      right = r.right;
    let node = el.parentElement;
    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      if (/hidden|clip|auto|scroll/.test(s.overflow + s.overflowX + s.overflowY)) {
        const pr = node.getBoundingClientRect();
        top = Math.max(top, pr.top);
        left = Math.max(left, pr.left);
        bottom = Math.min(bottom, pr.bottom);
        right = Math.min(right, pr.right);
      }
      node = node.parentElement;
    }
    return { x: left, y: top, w: right - left, h: bottom - top };
  };

  const isRendered = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    if (parseFloat(s.opacity) < 0.05) return false;
    return true;
  };

  // ── 1. content clipped inside an overflow:hidden box
  // Only counts when something a person must READ is cut off: a decorative child
  // (aria-hidden ring, blurred blob) deliberately sticking out of a clipping box is
  // not a defect, so the element's own scroll size is not enough evidence.
  const meaningfulBox = (root) => {
    let union = null;
    for (const el of root.querySelectorAll("*")) {
      if (el.closest("[aria-hidden='true']")) continue;
      if (!isRendered(el)) continue;
      const isControl = /^(INPUT|BUTTON|A|SELECT|TEXTAREA|IMG)$/.test(el.tagName);
      const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!isControl && !ownText) continue;
      // Use the PAINTED rect: content scrolled out of a horizontally scrollable strip
      // (the programme's day selector) is reachable, not clipped.
      const r = paintedRect(el);
      if (r.w <= 0 || r.h <= 0) continue;
      union = union
        ? {
            top: Math.min(union.top, r.y),
            left: Math.min(union.left, r.x),
            bottom: Math.max(union.bottom, r.y + r.h),
            right: Math.max(union.right, r.x + r.w),
          }
        : { top: r.y, left: r.x, bottom: r.y + r.h, right: r.x + r.w };
    }
    return union;
  };

  const clipped = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest(SKIP_SELECTOR)) continue;
    if (!isRendered(el)) continue;
    const s = getComputedStyle(el);
    if (!/hidden|clip/.test(s.overflow + s.overflowX + s.overflowY)) continue;
    if (el.clientHeight === 0 || el.clientWidth === 0) continue;
    const content = meaningfulBox(el);
    if (!content) continue;
    const box = el.getBoundingClientRect();
    const dy = Math.round(Math.max(0, content.bottom - box.bottom, box.top - content.top));
    const dx = Math.round(Math.max(0, content.right - box.right, box.left - content.left));
    if (dy <= 2 && dx <= 2) continue;
    const text = (el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40);
    clipped.push({
      el: describe(el),
      text,
      dy,
      dx,
      client: [el.clientWidth, el.clientHeight],
      scroll: [el.scrollWidth, el.scrollHeight],
    });
  }

  // ── leaves that a person can actually see
  const leaves = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest(SKIP_SELECTOR)) continue;
    if (!isRendered(el)) continue;
    const isControl = /^(INPUT|BUTTON|A|SELECT|TEXTAREA|IMG)$/.test(el.tagName);
    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!isControl && !ownText) continue;
    const pr = paintedRect(el);
    if (pr.w <= 2 || pr.h <= 2) continue; // clipped away entirely
    leaves.push({ el, pr });
  }

  // ── 2. overlapping, confirmed by what actually receives the pointer
  const overlaps = [];
  const floating = [];
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) {
      const a = leaves[i],
        b = leaves[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ox = Math.min(a.pr.x + a.pr.w, b.pr.x + b.pr.w) - Math.max(a.pr.x, b.pr.x);
      const oy = Math.min(a.pr.y + a.pr.h, b.pr.y + b.pr.h) - Math.max(a.pr.y, b.pr.y);
      if (ox <= 4 || oy <= 4) continue;
      const px = Math.max(a.pr.x, b.pr.x) + ox / 2;
      const py = Math.max(a.pr.y, b.pr.y) + oy / 2;
      const under = document.elementFromPoint(px, py);
      // An intentional overlay (a clear button inside an input) is fine as long as one
      // of the two elements is what the pointer actually lands on.
      const onA = under && (under === a.el || a.el.contains(under));
      const onB = under && (under === b.el || b.el.contains(under));
      if (!onA && !onB) continue;
      // A floating layer (the countdown pill) sits above page content on purpose. Report
      // it as information rather than a defect — a chat bubble over a long page is not a
      // layout bug, and flagging it every time would drown the real findings.
      const inFixedLayer = (el) => {
        let node = el;
        while (node && node !== document.documentElement) {
          if (getComputedStyle(node).position === "fixed") return true;
          node = node.parentElement;
        }
        return false;
      };
      const entry = {
        area: Math.round(ox * oy),
        size: [Math.round(ox), Math.round(oy)],
        a: describe(a.el),
        b: describe(b.el),
        aRect: [Math.round(a.pr.x), Math.round(a.pr.y), Math.round(a.pr.w), Math.round(a.pr.h)],
        bRect: [Math.round(b.pr.x), Math.round(b.pr.y), Math.round(b.pr.w), Math.round(b.pr.h)],
        pointer: onA ? "a" : "b",
      };
      if (inFixedLayer(a.el) || inFixedLayer(b.el)) {
        floating.push(entry);
        continue;
      }
      // A stretched link/button that covers a row's non-interactive labels is the
      // standard "whole row is clickable" pattern, not a collision.
      const wraps = (outer, inner) =>
        outer.x <= inner.x + 2 &&
        outer.y <= inner.y + 2 &&
        outer.x + outer.w >= inner.x + inner.w - 2 &&
        outer.y + outer.h >= inner.y + inner.h - 2;
      const interactiveEl = (el) =>
        /^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.getAttribute("role") === "button";
      if ((interactiveEl(a.el) && wraps(a.pr, b.pr)) || (interactiveEl(b.el) && wraps(b.pr, a.pr))) continue;
      // Nested controls (show-password inside its own input) are legitimate; parents
      // that merely contain the point are not.
      if (a.el.parentElement === b.el.parentElement && onA !== onB) continue;
      overlaps.push(entry);
    }
  }

  // ── 3. contrast
  const relativeLuminance = (rgb) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const parse = (value) => {
    const m = /rgba?\(([^)]+)\)/.exec(value);
    if (!m) return null;
    const parts = m[1].split(",").map((p) => parseFloat(p));
    return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
  };
  const effectiveBackground = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const s = getComputedStyle(node);
      const bg = parse(s.backgroundColor);
      if (bg && bg.alpha >= 1) return bg.rgb;
      // A translucent or gradient layer means we cannot resolve the true backdrop here.
      if (s.backgroundImage && s.backgroundImage !== "none") return null;
      node = node.parentElement;
    }
    return [255, 255, 255];
  };
  const lowContrast = [];
  for (const { el } of leaves) {
    const text = (el.innerText || el.value || el.placeholder || "").trim();
    if (!text || !GLYPH.test(text)) continue;
    if (el.tagName === "INPUT" && !el.placeholder) continue;
    const s = getComputedStyle(el);
    const size = parseFloat(s.fontSize);
    if (size < 8) continue;
    const fg = parse(s.color);
    const bg = effectiveBackground(el);
    if (!fg || !bg) continue;
    // Blend a translucent text colour over the background we resolved.
    const blended = fg.alpha >= 1 ? fg.rgb : fg.rgb.map((c, i) => c * fg.alpha + bg[i] * (1 - fg.alpha));
    const l1 = relativeLuminance(blended);
    const l2 = relativeLuminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      lowContrast.push({
        el: describe(el),
        text: text.slice(0, 40),
        ratio: Math.round(ratio * 100) / 100,
        need,
        size: Math.round(size),
        bold,
        color: s.color,
        background: `rgb(${bg.map((v) => Math.round(v)).join(", ")})`,
      });
    }
  }

  return {
    leaves: leaves.length,
    clipped,
    overlaps: overlaps.sort((a, b) => b.area - a.area).slice(0, 10),
    floating: floating.sort((a, b) => b.area - a.area).slice(0, 4),
    lowContrast: lowContrast.sort((a, b) => a.ratio - b.ratio).slice(0, 14),
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  };
}

const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const GREEN = "\u001b[32m";
const DIM = "\u001b[2m";
const RESET = "\u001b[0m";

async function main() {
  const browser = await chromium.launch();
  const report = [];
  let failures = 0;

  for (const route of ROUTES) {
    for (const width of WIDTHS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width, height: width < 600 ? 844 : 900 },
        colorScheme: theme === "dark" ? "dark" : "light",
      });
      if (theme === "dark") {
        await context.addInitScript(() => {
          // Seed the app's own theme key; it applies the class on boot. Touching
          // documentElement here would throw — init scripts can run before <html> exists.
          try {
            window.localStorage.setItem("theme", "dark");
          } catch {
            /* private mode — the app still reads prefers-color-scheme */
          }
        });
      }
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(String(error).slice(0, 160)));
      let result;
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 45000 });
        await page.waitForTimeout(SETTLE_MS);
        result = await page.evaluate(auditPage);
      } catch (error) {
        await context.close();
        failures++;
        report.push({ route, width, theme, error: String(error).slice(0, 200) });
        continue;
      }
      await context.close();

      const defects = result.clipped.length + result.overlaps.length + result.lowContrast.length + (result.horizontalOverflow ? 1 : 0);
      if (defects > 0) failures++;
      report.push({ route, width, theme, ...result, pageErrors });

      if (!AS_JSON) {
        const mark = defects === 0 ? `${GREEN}✔${RESET}` : `${RED}✖${RESET}`;
        const themeLabel = THEMES.length > 1 ? ` ${DIM}${theme}${RESET}` : "";
        console.log(`\n${mark} ${route} ${DIM}@ ${width}px${RESET}${themeLabel}  ${DIM}(${result.leaves} visible elements)${RESET}`);
        for (const c of result.clipped) {
          console.log(`   ${RED}clipped${RESET}  ${c.el} — "${c.text}" cut by ${c.dy}px vertical / ${c.dx}px horizontal`);
        }
        for (const o of result.overlaps) {
          console.log(`   ${RED}overlap${RESET}  ${o.size[0]}x${o.size[1]}px  ${o.a}  X  ${o.b}  ${DIM}(pointer lands on "${o.pointer}")${RESET}`);
        }
        for (const f of result.floating ?? []) {
          console.log(`   ${DIM}floating layer above content: ${f.a} X ${f.b} — expected for a fixed overlay${RESET}`);
        }
        for (const c of result.lowContrast) {
          console.log(`   ${YELLOW}contrast${RESET} ${c.ratio}:1 (needs ${c.need}) ${c.el} "${c.text}" — ${c.color} on ${c.background}`);
        }
        if (result.horizontalOverflow) {
          console.log(`   ${RED}overflow${RESET}  page is ${result.scrollWidth}px wide in a ${result.innerWidth}px viewport`);
        }
        if (pageErrors.length) {
          console.log(`   ${YELLOW}pageerror${RESET} ${pageErrors[0]}`);
        }
        if (defects === 0 && pageErrors.length === 0) console.log(`   ${DIM}clean${RESET}`);
      }
    }
    }
  }

  await browser.close();

  if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    const total = report.reduce(
      (sum, r) => sum + (r.clipped?.length ?? 0) + (r.overlaps?.length ?? 0) + (r.lowContrast?.length ?? 0),
      0
    );
    console.log(
      `\n${failures === 0 ? GREEN + "Audit clean." : RED + `Audit found defects on ${failures} route/viewport pair(s).`}${RESET} ${total} finding(s) across ${report.length} checks.\n`
    );
  }

  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`audit crashed: ${error?.stack ?? error}`);
  process.exit(2);
});
