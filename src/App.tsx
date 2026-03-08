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
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
    document.body.className = isDarkMode ? "dark" : "light";
    
    // Faster loading transition - only 800ms for the animation to play
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-falla-paper text-falla-ink font-sans selection:bg-falla-fire selection:text-white overflow-x-hidden">
      <Toaster 
        position="top-center" 
        richColors 
        toastOptions={{
          className: "ink-border soft-shadow-sm font-sans font-bold",
          style: {
            background: "#FAF7F2",
            border: "2px solid #1A1A1A",
            borderRadius: "16px"
          }
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
            colorBackground: "#FAF7F2",
            colorText: "#1A1A1A",
            borderRadius: "16px",
          },
          elements: {
            card: "border-2 border-[#1A1A1A] shadow-solid bg-[#FAF7F2]",
            navbar: "hidden",
            headerTitle: "font-display text-2xl uppercase tracking-widest",
            headerSubtitle: "font-sans font-bold",
            socialButtonsBlockButton: "border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:shadow-none bg-white",
            formButtonPrimary: "border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] hover:shadow-none bg-[#FF7043] text-white",
            footerActionLink: "text-[#FF7043] font-bold hover:underline",
            formFieldInput: "border-2 border-[#1A1A1A] rounded-xl px-4 h-12 bg-white focus:ring-2 focus:ring-[#FF7043]/20",
            dividerLine: "bg-[#1A1A1A] h-[2px]",
            dividerText: "font-bold text-[#1A1A1A]/40",
          }
        }}
      >
        <AppNavbar />
        
        <main className="flex-grow flex flex-col relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/map" element={<MapPage />} />
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
          <footer className="w-full flex flex-col items-center justify-center py-12 px-6 border-t-2 border-falla-ink/5 mt-auto bg-falla-paper">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-falla-fire rounded-full ink-border" />
              <span className="font-display text-2xl tracking-widest text-falla-fire">
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
