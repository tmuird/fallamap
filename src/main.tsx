// main.tsx or index.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./context/ThemeContext";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        {" "}
        {/* Ensure ThemeProvider wraps the entire app */}
        <NextUIProvider>
          <App />
        </NextUIProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
