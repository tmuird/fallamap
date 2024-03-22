import { NextUIProvider } from "@nextui-org/react";
import "@/styles/globals.css";
import {Route, Routes, useNavigate} from "react-router-dom";
import HomePage from "./components/HomePage";
import CalendarPage from "./components/CalendarPage.tsx"; // Assuming this is the component for calendar
import AppNavbar from "@/components/Navbar.tsx";
import { Link } from "@nextui-org/link"; // Assuming this is the layout component in src
import ContactPage from "@/components/ContactPage.tsx";
import SignInPage from "@/components/SignInPage.tsx";
import {ClerkProvider} from "@clerk/clerk-react";
import SignUpPage from "@/components/SignUpPage.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_YXB0LXNlYWd1bGwtODAuY2xlcmsuYWNjb3VudHMuZGV2JA";
if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key")
}


export default function App() {
    const navigate = useNavigate();
    
  return (
      <ClerkProvider navigate={navigate} publishableKey={PUBLISHABLE_KEY}>
          <NextUIProvider>
              <AppNavbar />
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/contact" element={<ContactPage/>} />
                  <Route path="/sign-in" element={<SignInPage/>} />
                  <Route path="/sign-up" element={<SignUpPage/>} />
              </Routes>

              <main className="container mx-auto max-w-7xl px-6 flex-grow"></main>
              <footer className="w-full flex items-center justify-center py-3">
                  <Link
                      isExternal
                      className="flex items-center gap-1 text-current"
                      href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
                      title="nextui.org homepage"
                  >
                      <span className="text-primary">Fallamap</span>
                  </Link>
              </footer>
          </NextUIProvider>
      </ClerkProvider>
   
  );
}
