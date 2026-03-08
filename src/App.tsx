import "@/styles/globals.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import MapPage from "./components/MapPage";
import SchedulePage from "./components/SchedulePage.tsx";
import AppNavbar from "@/components/Navbar.tsx";
import ContactPage from "@/components/ContactPage.tsx";
import SignInPage from "@/components/SignInPage.tsx";
import { neobrutalism } from "@clerk/themes";
import { ClerkProvider } from "@clerk/react";
import SignUpPage from "@/components/SignUpPage.tsx";
import { motion, AnimatePresence } from "framer-motion";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext.tsx";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Toaster } from "sonner";
import ModerationDashboard from "./components/admin/ModerationDashboard";
import UserProfile from "./components/profile/UserProfile";
import ArchivePage from "./components/ArchivePage";
import { MascletaCountdown } from "./components/ui/MascletaCountdown";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXB0LXNlYWd1bGwtODAuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
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

export default function App() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.className = isDarkMode ? "dark" : "light";
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-falla-paper text-falla-ink font-sans transition-colors duration-300 selection:bg-falla-fire selection:text-white overflow-x-hidden">
      <Toaster 
        position="top-center" 
        richColors 
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
            dividerLine: `${isDarkMode ? 'bg-[#FAF7F2]' : 'bg-[#1A1A1A]'} h-[2px]`,
            dividerText: `font-bold ${isDarkMode ? 'text-[#FAF7F2]/40' : 'text-[#1A1A1A]/40'}`,
          }
        }}
      >
        <AppNavbar />
        
        <main className="flex-grow flex flex-col relative">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/map" element={<PageWrapper><MapPage /></PageWrapper>} />
              <Route path="/schedule" element={<PageWrapper><SchedulePage /></PageWrapper>} />
              <Route path="/archive" element={<PageWrapper><ArchivePage /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
              <Route path="/profile" element={<PageWrapper><UserProfile /></PageWrapper>} />
              <Route path="/sign-in" element={<PageWrapper><SignInPage /></PageWrapper>} />
              <Route path="/sign-up" element={<PageWrapper><SignUpPage /></PageWrapper>} />
              <Route path="/dashboard" element={<PageWrapper><ModerationDashboard /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
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
