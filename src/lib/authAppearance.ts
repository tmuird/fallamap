export const AUTH_APPEARANCE = {
  elements: {
    rootBox: "!w-full !max-w-none !min-w-0",
    // Clerk's own `.cl-cardBox` ships a fixed `width: 400px`; inside our narrower
    // two-column shell that overflowed the viewport instead of reflowing, so the form
    // gets clipped on tablets and small laptops. Force every wrapper fluid.
    cardBox: "!w-full !max-w-none !min-w-0 !shadow-none",
    card: "!w-full !max-w-none !min-w-0 !border-0 !bg-transparent !p-0 !shadow-none",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    formFieldRow: "!static !w-full",
    formFieldLabel: "text-xs font-black uppercase tracking-wider text-falla-ink/70",
    formFieldInput:
      "!h-12 !w-full !rounded-xl !border-2 !border-falla-ink/15 !bg-falla-paper px-4 font-semibold focus:!border-falla-fire",
    formButtonPrimary:
      "!h-12 !w-full !rounded-xl !border-2 !border-falla-ink !bg-falla-fire text-sm font-black uppercase tracking-widest !text-white shadow-solid hover:!shadow-none",
    socialButtonsBlockButton:
      "!h-12 !w-full !rounded-xl !border-2 !border-falla-ink/15 !bg-falla-paper font-bold hover:!border-falla-ink",
    socialButtonsBlockButtonText: "text-xs font-black uppercase tracking-wider",
    footer: "hidden",
  },
} as const;
