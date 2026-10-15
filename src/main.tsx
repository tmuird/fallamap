import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppBootGuard } from "./components/ui/AppBootGuard";
import { MotionConfig } from "framer-motion";
const root = ReactDOM.createRoot(
 document.getElementById("root") as HTMLElement,
);
root.render(
 <React.StrictMode>
  <BrowserRouter>
   <ThemeProvider>
    {" "}
    {/* Ensure ThemeProvider wraps the entire app */}
    <HeroUIProvider>
     {/* Outermost guard: clerks's script failing to load used to empty #root entirely. */}
     <AppBootGuard>
      {/* reducedMotion="user" makes every framer-motion animation in the app follow the OS
          "reduce motion" setting in one place: transforms and layout animations are dropped,
          opacity fades are kept (they are the part that helps rather than harms). */}
      <MotionConfig reducedMotion="user">
       <App />
      </MotionConfig>
     </AppBootGuard>
    </HeroUIProvider>
   </ThemeProvider>
  </BrowserRouter>
 </React.StrictMode>,
);
