import "@/styles/globals.css";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./components/HomePage";
import SchedulePage from "./components/SchedulePage.tsx"; // Assuming this is the component for calendar
import AppNavbar from "@/components/Navbar.tsx";
import ContactPage from "@/components/ContactPage.tsx";
import SignInPage from "@/components/SignInPage.tsx";
import { neobrutalism } from "@clerk/themes";
import { ClerkProvider } from "@clerk/clerk-react";
import SignUpPage from "@/components/SignUpPage.tsx";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import "./styles/transition-styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXB0LXNlYWd1bGwtODAuY2xlcmsuYWNjb3VudHMuZGV2JA";
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext.tsx";

export default function App() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);
  // Use type assertion here to tell TypeScript that you expect the location object to have a 'key' property.
  const locationWithKey = location as unknown as Location & { key: string };
  return (
    <div className={`App ${isDarkMode ? "dark" : "light"}`}>
      <ClerkProvider
        navigate={navigate}
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          baseTheme: neobrutalism,
        }}
      >
        <AppNavbar />
        <TransitionGroup>
          <CSSTransition
            key={locationWithKey.key}
            classNames="fade"
            timeout={300}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
            </Routes>
          </CSSTransition>
        </TransitionGroup>

        <main className="container mx-auto max-w-7xl px-6 flex-grow"></main>
        <footer className="w-full flex items-center justify-center py-3">
          <span className="text-primary">Fallamap</span>
        </footer>
      </ClerkProvider>
    </div>
  );
}
