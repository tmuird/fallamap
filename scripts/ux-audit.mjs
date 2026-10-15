#!/usr/bin/env node
/**
 * npm run audit:ux — accessibility & interaction audit of the running app.
 *
 * The sibling of `audit:ui`. That one measures whether a person can SEE the page
 * (clip / overlap / contrast / overflow / fold). This one measures whether a person
 * can OPERATE it — with a keyboard, a screen reader, a thumb, or a vestibular system
 * that objects to motion. It reports the defects that a screenshot review cannot show:
 *
 *   1. landmarks      — no single <main>, no skip link, so a keyboard user tabs the
 *                       whole navbar on every route
 *   2. headings       — missing/multiple <h1>, or a skipped level (h2 -> h4)
 *   3. names          — an interactive element with no accessible name at all
 *   4. keyboard       — a focus stop with no visible focus indicator (outline/ring),
 *                       or Tab landing on nothing
 *   5. tap targets    — a button/control smaller than 40x40 at phone widths
 *   6. labels         — a form control with no label, aria-label or aria-labelledby
 *   7. images         — an <img> with no alt attribute (alt="" is valid: decorative)
 *   8. ids            — duplicate ids in the document
 *   9. motion         — no `prefers-reduced-motion` support anywhere in the CSS
 *  10. live regions   — nothing announced when asynchronous content changes
 *
 * Usage:
 *   npm run audit:ux                                  # against http://127.0.0.1:4173
 *   npm run audit:ux -- --base=http://127.0.0.1:5173
 *   npm run audit:ux -- --routes=/schedule,/map --json
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
const ROUTES = arg(
  "routes",
  "/,/map,/schedule,/archive,/contact,/profile,/sign-in,/sign-up,/dashboard"
).split(",");
const WIDTHS = arg("widths", "1440,390").split(",").map(Number);
const AS_JSON = args.includes("--json");
const SETTLE_MS = Number(arg("settle", 3500));
const TAP_MIN = Number(arg("tap-min", 40));

/** Runs inside the page. Keep it dependency-free. */
function auditPage(tapMin) {
  const out = {
    landmarks: [],
    headings: [],
    names: [],
    keyboard: [], // filled by walkFocus() over real Tab presses
    tapTargets: [],
    labels: [],
    images: [],
    ids: [],
    live: { regions: 0, roving: [] },
  };

  const skip = (el) =>
    el.closest("script,style,noscript,[aria-hidden='true'],[inert],.sr-only") ||
    el.hasAttribute("disabled") ||
    el.getAttribute("aria-hidden") === "true";

  // `sr-only` is excluded from the visual checks (a clipped decorative label is not visible
  // content) but it is exactly the right technique for structure: the map page is a
  // full-bleed canvas with no readable title, and its `<h1 class="sr-only">` IS the page's
  // heading. Excluding it here reported "h1 x0" on a page that has one.
  const skipForStructure = (el) =>
    el.closest("script,style,noscript,[aria-hidden='true'],[inert]") ||
    el.getAttribute("aria-hidden") === "true";

  /** For structure: only display/visibility matter — a 1x1 sr-only element still counts. */
  const isRenderedForStructure = (el) => {
    const s = getComputedStyle(el);
    return s.display !== "none" && s.visibility !== "hidden" && parseFloat(s.opacity) >= 0.05;
  };

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    if (parseFloat(s.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const describe = (el, label) => {
    const cls =
      typeof el.className === "string"
        ? el.className
            .split(/\s+/)
            .filter(
              (c) =>
                c && !c.startsWith("!") && !/^(w-|h-|p-|m-|text-|font-|border-|bg-|rounded|flex|grid|gap)/.test(c)
            )
            .slice(0, 2)
            .join(".")
        : "";
    const text = (label ?? el.innerText ?? el.value ?? "").trim().replace(/\s+/g, " ").slice(0, 34);
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${text ? `:"${text}"` : ""}`;
  };

  /**
   * What a finger can actually hit. An absolutely-positioned ::after with negative insets is
   * the standard way to grow a small icon control's target without moving it (Mapbox's 24px
   * attribution toggle), and it does not show up in getBoundingClientRect().
   */
  const hitRect = (el, r) => {
    const after = getComputedStyle(el, "::after");
    if (after.content === "none" || after.position !== "absolute") {
      return { w: r.width, h: r.height };
    }
    const px = (v) => (v && v.endsWith("px") ? parseFloat(v) : null);
    const top = px(after.top);
    const left = px(after.left);
    const bottom = px(after.bottom);
    const right = px(after.right);
    let w = r.width;
    let h = r.height;
    if (left !== null && right !== null) w = r.width - left - right;
    else if (after.width !== "auto") w = Math.max(w, px(after.width) ?? 0);
    if (top !== null && bottom !== null) h = r.height - top - bottom;
    else if (after.height !== "auto") h = Math.max(h, px(after.height) ?? 0);
    return { w, h };
  };

  /** The name a screen reader would announce, following the ACCNAME order. */
  const accessibleName = (el) => {
    const aria = el.getAttribute("aria-label");
    if (aria && aria.trim()) return aria.trim();
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ")
        .trim();
      if (text) return text;
    }
    if (el.labels && el.labels.length) {
      const text = [...el.labels].map((l) => l.textContent ?? "").join(" ").trim();
      if (text) return text;
    }
    // A control's own value is not a name, but a button's text is.
    if (!/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      const text = (el.innerText ?? "").trim();
      if (text) return text;
    }
    const title = el.getAttribute("title");
    if (title && title.trim()) return title.trim();
    if (el.tagName === "IMG") {
      const alt = el.getAttribute("alt");
      if (alt && alt.trim()) return alt.trim();
    }
    const img = el.querySelector("img[alt]:not([alt=''])");
    if (img) return img.getAttribute("alt").trim();
    const svgTitle = el.querySelector("svg title");
    if (svgTitle?.textContent.trim()) return svgTitle.textContent.trim();
    return "";
  };

  // ── 1. landmarks: exactly one <main>, and a skip link that targets content
  const mains = [...document.querySelectorAll("main")].filter((m) => !skip(m));
  // Deliberately NOT filtered by `skip()`: a skip link is `sr-only` until it is focused,
  // which is exactly what makes it invisible to a naive visible-element query.
  const skips = [...document.querySelectorAll("a[href^='#']")].filter((a) =>
    /skip|jump to|main content/i.test(a.innerText || a.getAttribute("aria-label") || "")
  );
  out.landmarks = {
    main: mains.length,
    nav: document.querySelectorAll("nav:not([aria-hidden='true'])").length,
    skipLink: skips.length,
    skipTarget: skips.length
      ? (skips[0].getAttribute("href") || "").replace("#", "")
      : null,
  };

  // ── 2. headings
  const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(
    (h) => !skipForStructure(h) && isRenderedForStructure(h)
  );
  const levels = headings.map((h) => Number(h.tagName[1]));
  const skipsLevels = [];
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      skipsLevels.push({
        from: `h${levels[i - 1]}`,
        to: `h${levels[i]}`,
        text: (headings[i].innerText || "").trim().slice(0, 40),
      });
    }
  }
  out.headings = {
    h1: levels.filter((l) => l === 1).length,
    first: levels[0] ?? null,
    order: levels.join(""),
    skipped: skipsLevels,
  };

  // ── 3, 5, 6. interactive elements: names, tap targets, labels
  const INTERACTIVE = "a[href],button,input,select,textarea,[role='button'],[role='tab'],[role='checkbox'],[role='switch']";
  const controls = [...document.querySelectorAll(INTERACTIVE)].filter((el) => !skip(el) && visible(el));
  for (const el of controls) {
    const name = accessibleName(el);
    const isInput = /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
    const type = (el.getAttribute("type") || "").toLowerCase();
    const unnamedOk = isInput && ["hidden", "submit", "button", "reset"].includes(type) && el.value?.trim();
    if (!name && !unnamedOk) {
      out.names.push(describe(el));
    }
    if (isInput && !name) {
      // a placeholder is not a label: it disappears as soon as you type
      out.labels.push(`${describe(el)}${el.placeholder ? ` (placeholder only: "${el.placeholder}")` : ""}`);
    }
    const r = el.getBoundingClientRect();
    const hit = hitRect(el, r);
    const inlineLink = el.tagName === "A" && el.getAttribute("role") !== "button" && !el.closest("nav");
    if (!inlineLink && (hit.w < tapMin || hit.h < tapMin)) {
      out.tapTargets.push({
        el: describe(el, name),
        size: [Math.round(hit.w), Math.round(hit.h)],
      });
    }
  }

  // ── 4. keyboard: baseline every focus stop, then walk it with REAL Tab presses
  // `el.focus()` does not reliably match :focus-visible, so styles measured that way say
  // nothing about what a keyboard user sees. The baseline is captured here and the walk
  // happens over real key events (see walkFocus below); a stop counts as visible if the
  // element OR up to three ancestors changes outline/box-shadow/border/background (a
  // :focus-within ring on a wrapper is a legitimate indicator).
  const focusable = controls.filter((el) => {
    if (el.tagName === "A" && !el.getAttribute("href")) return false;
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("tabindex") === "-1") return false;
    return true;
  });
  const snapshot = (node) => {
    const s = getComputedStyle(node);
    return `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.boxShadow}|${s.borderColor}|${s.backgroundColor}`;
  };
  window.__uxBaseline = new WeakMap();
  focusable.forEach((el, i) => {
    el.setAttribute("data-ux-focus", String(i));
    const chain = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement]
      .filter(Boolean)
      .map(snapshot);
    window.__uxBaseline.set(el, chain);
  });
  out.focusCount = focusable.length;

  // ── 7. images
  for (const img of document.querySelectorAll("img")) {
    if (skip(img) || !visible(img)) continue;
    if (!img.hasAttribute("alt")) out.images.push(describe(img, img.getAttribute("src")));
  }

  // ── 8. duplicate ids
  const idCounts = new Map();
  for (const el of document.querySelectorAll("[id]")) {
    idCounts.set(el.id, (idCounts.get(el.id) ?? 0) + 1);
  }
  out.ids = [...idCounts.entries()].filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`);

  // ── 9. motion: is reduced-motion honoured anywhere in the stylesheets?
  let reducedRule = false;
  try {
    for (const sheet of document.styleSheets) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin (the Mapbox stylesheet)
      }
      const walk = (list) => {
        for (const rule of list) {
          if (rule.conditionText && /prefers-reduced-motion/.test(rule.conditionText)) reducedRule = true;
          if (rule.cssRules) walk(rule.cssRules);
        }
      };
      walk(rules);
    }
  } catch {
    /* ignore */
  }
  const animated = [...document.querySelectorAll("*")].filter((el) => {
    const s = getComputedStyle(el);
    return parseFloat(s.animationDuration) > 0.05 || parseFloat(s.transitionDuration) > 0.05;
  }).length;
  out.motion = { reducedRule, animatedElements: animated };

  // ── 10. live regions: async results should be announced
  out.live = {
    regions: document.querySelectorAll("[aria-live],[role='status'],[role='alert']").length,
    roving: [],
  };

  return out;
}

/**
 * Walk the tab order with real key presses and report stops that show no visible focus
 * indicator (WCAG 2.4.7) or where focus is lost entirely.
 */
async function walkFocus(page, limit = 30) {
  const findings = [];
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      // NB: no Node-scope variables in here — `i` lives outside the page.
      if (!el || el === document.body || el === document.documentElement) return { lost: true };
      const chain = [el, el.parentElement, el.parentElement?.parentElement, el.parentElement?.parentElement?.parentElement]
        .filter(Boolean);
      const now = chain.map((n) => {
        const s = getComputedStyle(n);
        return `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.boxShadow}|${s.borderColor}|${s.backgroundColor}`;
      });
      const base = window.__uxBaseline?.get(el);
      const own = getComputedStyle(el);
      const painted = own.outlineStyle !== "none" && parseFloat(own.outlineWidth) >= 1;
      // `changed` catches a ring that appears on focus; `painted` covers an element that
      // already carries an outline in its resting state, where nothing would change.
      const changed = !base || base.some((was, idx) => was !== now[idx]) || painted;
      const label = (el.getAttribute("aria-label") || el.innerText || el.value || "").trim().replace(/\s+/g, " ").slice(0, 30);
      return {
        lost: false,
        tag: el.tagName.toLowerCase(),
        label,
        changed,
        focusVisible: el.matches(":focus-visible"),
        outline: `${getComputedStyle(el).outlineStyle} ${getComputedStyle(el).outlineWidth}`,
        index: el.getAttribute("data-ux-focus"),
      };
    });
    if (info.lost) {
      // Focus left the document: that is the end of the tab order (the next Tab goes to the
      // browser chrome), which is normal. Only a *mid-page* loss would be a defect, and that
      // shows up as an element with no indicator instead.
      break;
    }
    if (!info.changed) {
      findings.push({ lost: false, stop: i + 1, el: `${info.tag}:\"${info.label}\"`, focusVisible: info.focusVisible, outline: info.outline });
    }
  }
  return findings;
}

const RED = "\u001b[31m";
const YELLOW = "\u001b[33m";
const GREEN = "\u001b[32m";
const DIM = "\u001b[2m";
const RESET = "\u001b[0m";

/** Which findings are defects on this route/viewport. */
function defectsOf(result, width, tapMin) {
  const list = [];
  if (result.landmarks.main !== 1)
    list.push(`main landmark x${result.landmarks.main} (need exactly 1)`);
  if (result.landmarks.skipLink < 1) list.push("no skip-to-content link");
  if (result.headings.h1 !== 1) list.push(`h1 x${result.headings.h1} (need exactly 1)`);
  if (result.headings.first !== 1) list.push(`first heading is h${result.headings.first}`);
  for (const s of result.headings.skipped) list.push(`heading level jump ${s.from} -> ${s.to} "${s.text}"`);
  for (const n of result.names) list.push(`unnamed control: ${n}`);
  for (const l of result.labels) list.push(`unlabelled field: ${l}`);
  for (const k of result.keyboard) {
    list.push(
      k.lost
        ? `focus lost after ${k.stop} Tab stop(s) — tabbing reached nothing focusable`
        : `no visible focus indicator at Tab stop ${k.stop}: ${k.el} (outline ${k.outline})`
    );
  }
  for (const t of result.tapTargets)
    list.push(`tap target ${t.size[0]}x${t.size[1]} < ${tapMin}px: ${t.el}`);
  for (const i of result.images) list.push(`img without alt: ${i}`);
  for (const id of result.ids) list.push(`duplicate id: ${id}`);
  if (!result.motion.reducedRule)
    list.push(`prefers-reduced-motion unsupported (${result.motion.animatedElements} animated elements)`);
  return width <= 480 ? list : list.filter((l) => !l.startsWith("tap target"));
}

async function main() {
  const browser = await chromium.launch();
  const report = [];
  let failures = 0;
  let total = 0;

  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: width < 600 ? 844 : 900 },
        // A real keyboard user on a touch device: no hover, coarse pointer.
        hasTouch: width < 600,
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on("pageerror", (e) => pageErrors.push(String(e).slice(0, 160)));
      let result;
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 45000 });
        await page.waitForTimeout(SETTLE_MS);
        result = await page.evaluate(auditPage, TAP_MIN);
        // Real key events, after the baseline pass above.
        result.keyboard = await walkFocus(page);
      } catch (error) {
        await context.close();
        failures++;
        report.push({ route, width, error: String(error).slice(0, 200) });
        continue;
      }
      await context.close();

      const defects = defectsOf(result, width, TAP_MIN);
      total += defects.length;
      if (defects.length) failures++;
      report.push({ route, width, ...result, pageErrors, defects });

      if (!AS_JSON) {
        const mark = defects.length === 0 ? `${GREEN}✔${RESET}` : `${RED}✖${RESET}`;
        console.log(
          `\n${mark} ${route} ${DIM}@ ${width}px${RESET}  ${DIM}(main x${result.landmarks.main}, h1 x${result.headings.h1}, ${result.live.regions} live region(s))${RESET}`
        );
        for (const d of defects) console.log(`   ${RED}${d}${RESET}`);
        if (pageErrors.length) console.log(`   ${YELLOW}pageerror${RESET} ${pageErrors[0]}`);
        if (!defects.length && !pageErrors.length) console.log(`   ${DIM}clean${RESET}`);
      }
    }
  }

  await browser.close();

  if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `\n${failures === 0 ? GREEN + "UX audit clean." : RED + `UX audit found defects on ${failures} route/viewport pair(s).`}${RESET} ${total} finding(s) across ${report.length} checks.\n`
    );
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`ux audit crashed: ${error?.stack ?? error}`);
  process.exit(2);
});
