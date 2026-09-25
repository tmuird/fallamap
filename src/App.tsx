import "@/styles/globals.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import AppNavbar from "@/components/Navbar.tsx";
import { neobrutalism } from "@clerk/themes";
import { ClerkProvider, useUser } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, lazy, Suspense } from "react";
import { useTheme } from "@/context/ThemeContext.tsx";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Toaster } from "sonner";
import { MascletaCountdown } from "./components/ui/MascletaCountdown";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { SupabaseAuthBridge } from "./lib/SupabaseAuthBridge";
import { CommunityOfflineBanner } from "./components/ui/CommunityOfflineBanner";
import { startBackendMonitor } from "./lib/backendStatus";

// T2.7: route-level code splitting. The landing page stays eager (no first-paint
// flash); every other route loads its chunk on demand.
const MapPage = lazy(() => import("./components/MapPage"));
const SchedulePage = lazy(() => import("./components/SchedulePage.tsx"));
const ArchivePage = lazy(() => import("./components/ArchivePage"));
const ContactPage = lazy(() => import("@/components/ContactPage.tsx"));
const UserProfile = lazy(() => import("./components/profile/UserProfile"));
const ModerationDashboard = lazy(
  () => import("./components/admin/ModerationDashboard")
);
const SignInPage = lazy(() => import("@/components/SignInPage.tsx"));
const SignUpPage = lazy(() => import("@/components/SignUpPage.tsx"));

// Shown while a route chunk is still loading (cold cache / slow network).
const PageFallback = () => (
  <div
    className="w-full flex-grow flex flex-col items-center justify-center gap-4 p-12"
    role="status"
    aria-label="Loading page"
  >
    <div className="h-2 w-40 rounded-full bg-falla-ink/10 animate-pulse" />
    <div className="h-2 w-24 rounded-full bg-falla-ink/10 animate-pulse" />
  </div>
);

const RouteSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageFallback />}>{children}</Suspense>
);

// T2.4: fail fast when the Clerk key is missing. The old `||` fallback
// silently booted a hardcoded dev instance, so a misconfigured deploy looked
// "working" against the wrong auth backend.
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "Missing VITE_CLERK_PUBLISHABLE_KEY — set it in .env (see .env.example). " +
      "Refusing to fall back to a hardcoded Clerk instance."
  );
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="w-full flex-grow flex flex-col"
  >
    {children}
  </motion.div>
);

// T2.3: reports Clerk client readiness up to the boot loading gate (App's
// splash lives above ClerkProvider, so it can't read Clerk hooks directly).
function ClerkReadyGate({ onReady }: { onReady: (v: boolean) => void }) {
  const { isLoaded } = useUser();
  useEffect(() => {
    if (isLoaded) onReady(true);
  }, [isLoaded, onReady]);
  return null;
}

export default function App() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  // T2.3: the splash used to be a fixed 1.2s timer. It now gates on real
  // readiness — initial assets (fonts + window load) here, Clerk via
  // ClerkReadyGate — with a 300ms minimum so it can't flash open and a 3s
  // failsafe that force-reveals so a stalled asset can never trap anyone.
  const [assetsReady, setAssetsReady] = useState(false);
  const [clerkReady, setClerkReady] = useState(false);
  const loading = !(assetsReady && clerkReady);

  useEffect(() => {
    let cancelled = false;
    let minTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    const reveal = () => {
      if (!cancelled) {
        setAssetsReady(true);
        setClerkReady(true);
      }
    };
    const failsafe = setTimeout(reveal, 3000);

    const fontsReady: Promise<unknown> =
      "fonts" in document ? document.fonts.ready : Promise.resolve();
    const windowLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener("load", () => resolve(), { once: true })
          );

    Promise.all([fontsReady, windowLoaded]).then(() => {
      const minRemaining = Math.max(0, 300 - (Date.now() - startedAt));
      minTimer = setTimeout(() => {
        if (!cancelled) setAssetsReady(true);
      }, minRemaining);
    });

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      if (minTimer) clearTimeout(minTimer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.className = isDarkMode ? "dark" : "light";
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  // T1.1: watch Supabase reachability for the community-offline banner
  useEffect(() => startBackendMonitor(), []);

  return (
    <div className="flex flex-col min-h-screen bg-falla-paper text-falla-ink font-sans transition-colors duration-300 selection:bg-falla-fire selection:text-white overflow-x-hidden">
      <Toaster 
        position="top-center" 
        richColors 
        expand={true}
        gap={12}
        theme={isDarkMode ? 'dark' : 'light'}
        toastOptions={{
          className: "ink-border soft-shadow-lg font-sans font-bold !bg-falla-paper !text-falla-ink border-2",
          style: {
            borderRadius: '24px',
            padding: '16px 24px',
            border: '2.5px solid var(--falla-ink)',
          },
          actionButtonStyle: {
            backgroundColor: 'var(--falla-fire)',
            color: 'white',
            borderRadius: '12px',
            padding: '8px 16px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontSize: '10px',
            border: '2px solid var(--falla-ink)',
            boxShadow: '2px 2px 0px 0px var(--falla-ink)',
          },
        }}
      />
      
      <AnimatePresence mode="wait">
        {loading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <ClerkProvider
        routerPush={(to: string) => navigate(to)}
        routerReplace={(to: string) => navigate(to, { replace: true })}
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          baseTheme: neobrutalism,
          variables: {
            colorPrimary: "#FF7043",
            colorBackground: isDarkMode ? "#1A1A1A" : "#FAF7F2",
            colorText: isDarkMode ? "#FAF7F2" : "#1A1A1A",
            borderRadius: "16px",
          },
          elements: {
            card: `border-2 ${isDarkMode ? 'border-[#FAF7F2]' : 'border-[#1A1A1A]'} shadow-solid bg-falla-paper`,
            navbar: "hidden",
            headerTitle: "font-display text-2xl uppercase tracking-widest",
            headerSubtitle: "font-sans font-bold",
            socialButtonsBlockButton: `border-2 ${isDarkMode ? 'border-[#FAF7F2]' : 'border-[#1A1A1A]'} shadow-solid-sm hover:shadow-none bg-falla-paper`,
            formButtonPrimary: `border-2 ${isDarkMode ? 'border-[#FAF7F2]' : 'border-[#1A1A1A]'} shadow-solid-sm hover:shadow-none bg-[#FF7043] text-white`,
            footerActionLink: "text-[#FF7043] font-bold hover:underline",
            formFieldInput: `border-2 ${isDarkMode ? 'border-[#FAF7F2]' : 'border-[#1A1A1A]'} rounded-xl px-4 h-12 bg-falla-paper focus:ring-2 focus:ring-[#FF7043]/20`,
            // Clerk's neobrutalism theme sets the password row to position:absolute,
            // which collapses its width and stacks it on top of the email field.
            formFieldRow: "!static !w-full",
            dividerLine: `${isDarkMode ? 'bg-[#FAF7F2]' : 'bg-[#1A1A1A]'} h-[2px]`,
            dividerText: `font-bold ${isDarkMode ? 'text-[#FAF7F2]/40' : 'text-[#1A1A1A]/40'}`,
          }
        }}
      >
        <SupabaseAuthBridge />
        <ClerkReadyGate onReady={setClerkReady} />
        <AppNavbar />
        <CommunityOfflineBanner />
        
        <main className="flex-grow flex flex-col relative">
          <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/map" element={<PageWrapper><RouteSuspense><MapPage /></RouteSuspense></PageWrapper>} />
              <Route path="/schedule" element={<PageWrapper><RouteSuspense><SchedulePage /></RouteSuspense></PageWrapper>} />
              <Route path="/archive" element={<PageWrapper><RouteSuspense><ArchivePage /></RouteSuspense></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><RouteSuspense><ContactPage /></RouteSuspense></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><RouteSuspense><UserProfile /></RouteSuspense></PageWrapper>} />
              <Route path="/sign-in" element={<PageWrapper><RouteSuspense><SignInPage /></RouteSuspense></PageWrapper>} />
              <Route path="/sign-up" element={<PageWrapper><RouteSuspense><SignUpPage /></RouteSuspense></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><RouteSuspense><ModerationDashboard /></RouteSuspense></PageWrapper>} />
            </Routes>
          </AnimatePresence>
          </ErrorBoundary>
        </main>

        <MascletaCountdown />

        {location.pathname !== "/map" && (
          <footer className="w-full flex flex-col items-center justify-center py-12 px-6 border-t-2 border-falla-ink/5 mt-auto bg-falla-paper transition-colors duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-falla-fire rounded-full ink-border" />
              <span className="font-display text-3xl tracking-widest text-falla-fire">
                fallamap
              </span>
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-falla-ink/30 uppercase">
              © 2026 valència
            </p>
          </footer>
        )}
      </ClerkProvider>
    </div>
  );
}
