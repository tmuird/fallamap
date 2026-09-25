/**
 * Per-tenant branding & copy — the single source of truth for every
 * user-facing string that names the brand, the event, the city, or
 * festival-specific culture (white-label: T2.8).
 *
 * To re-brand for another event: edit this file (plus `fallas.json` /
 * `official_events.json` for data) — components read all such copy from
 * here, so nothing in `src/components` hardcodes festival wording.
 * The HTML `<title>` is injected from `brand.pageTitle` by the siteTitle
 * plugin in vite.config.ts (dev + build).
 *
 * Keep this module free of imports: vite.config.ts loads it in Node
 * context at config time.
 */

export interface SiteConfig {
  brand: {
    /** Logotype shown in navbar / header / footer (lowercase styling). */
    name: string;
    /** Browser tab title (`<title>`) and default share title. */
    pageTitle: string;
    /** ICS calendar `PRODID` value. */
    icsProdId: string;
    /** Contact page email address. */
    contactEmail: string;
  };
  event: {
    /** Full event name used in ICS summaries, share titles and filenames. */
    name: string;
    /** Slug appended to ICS download filenames. */
    fileSlug: string;
  };
  nouns: {
    /** Singular noun for one POI/monument ("Falla #3"). */
    monument: string;
    /** Plural noun for the header count pill ("80 Monuments"). */
    monumentPlural: string;
  };
  location: {
    /** City shown in the header "Live from …", contact card and footer. */
    city: string;
    /** Contact card location line. */
    district: string;
    /** Footer copyright line. */
    copyright: string;
  };
  header: {
    /** Header pill next to the monument count. */
    programLabel: string;
    /** Header live-location prefix ("Live from …"). */
    livePrefix: string;
  };
  hero: {
    /** Landing headline, split around the animated highlight word. */
    headlineBefore: string;
    headlineHighlight: string;
    headlineAfter: string;
    /** Status pill under the headline (highlight + suffix). */
    pulseHighlight: string;
    pulseSuffix: string;
    /** Hero image caption. */
    imageCaption: string;
    imageSub: string;
  };
  /** Short local phrase quoted on the landing and archive pages. */
  tagline: string;
  archive: {
    /** Archive notice, split around the highlighted span. */
    noticeBefore: string;
    noticeHighlight: string;
    noticeAfter: string;
  };
  contact: {
    /** Contact headline, split around the highlighted word. */
    headlineBefore: string;
    headlineHighlight: string;
    /** Intro sentence under the headline. */
    intro: string;
    /** Community-support paragraph. */
    supportText: string;
  };
  profile: {
    /** Signed-in greeting prefix ("Bon dia, …"). */
    greeting: string;
    /** Fallback name when the user has no first name. */
    defaultName: string;
    /** Tagline under the profile heading. */
    tagline: string;
    /** Rank titles by number of check-ins (top / middle / starting). */
    rankTop: string;
    rankMid: string;
    rankLow: string;
  };
  countdown: {
    idleLabel: string;
    idleTitle: string;
    liveLabel: string;
    liveTitle: string;
    liveBanner: string;
    /** Daily start time of the counted-down event… */
    hour: number;
    minute: number;
    /** …and how long the "live" window lasts (minutes). */
    liveWindowMinutes: number;
    /** IANA zone the daily time is defined in (T2.9 wires the computation). */
    timeZone: string;
  };
  admin: {
    /** Shown on /dashboard when the signed-in user is not an admin. */
    accessDenied: string;
  };
}

export const SITE: SiteConfig = {
  brand: {
    name: "fallamap",
    pageTitle: "fallamap | valència 2026",
    icsProdId: "-//Fallamap//EN",
    contactEmail: "hola@fallamap.es",
  },
  event: {
    name: "Las Fallas 2026",
    fileSlug: "Fallas2026",
  },
  nouns: {
    monument: "Falla",
    monumentPlural: "Monuments",
  },
  location: {
    city: "València",
    district: "Ciutat Vella, València",
    copyright: "© 2026 valència",
  },
  header: {
    programLabel: "Official Program",
    livePrefix: "Live from",
  },
  hero: {
    headlineBefore: "Feel the",
    headlineHighlight: "heat",
    headlineAfter: "of the streets.",
    pulseHighlight: "La Plantà",
    pulseSuffix: "in progress",
    imageCaption: "Plaça de l'Ajuntament",
    imageSub: "Falla Municipal 2026",
  },
  tagline: "\"Deixe'm que et conte...\"",
  archive: {
    noticeBefore: "We're currently documenting the",
    noticeHighlight: "2026 festival",
    noticeAfter:
      ". Previous years will be restored to the digital heritage map after the final Cremà.",
  },
  contact: {
    headlineBefore: "Connect with the",
    headlineHighlight: "Flame",
    intro:
      "Have questions about the festival? Found a missing Ninot? We'd love to hear from you.",
    supportText:
      "Our team of dedicated Falleros is ready to help you navigate the city during the 2026 season. Expect a reply within 24 hours.",
  },
  profile: {
    greeting: "Bon dia",
    defaultName: "Faller",
    tagline: "València's Street Art Scout",
    rankTop: "Legend of the Cremà",
    rankMid: "Dedicated Faller",
    rankLow: "Amateur Scout",
  },
  countdown: {
    idleLabel: "Mascletà Daily",
    idleTitle: "Next Explosion",
    liveLabel: "Happening Now",
    liveTitle: "nit del foc",
    liveBanner: "Valencia is Shaking",
    hour: 14,
    minute: 0,
    liveWindowMinutes: 10,
    timeZone: "Europe/Madrid",
  },
  admin: {
    accessDenied: "You must be a Fallamap administrator to review content.",
  },
};
