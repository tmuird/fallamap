import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppBootGuard } from "./components/ui/AppBootGuard";
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
      <App />
     </AppBootGuard>
    </HeroUIProvider>
   </ThemeProvider>
  </BrowserRouter>
 </React.StrictMode>,
);
