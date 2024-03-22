

import { NextUIProvider } from "@nextui-org/react";
// import { ThemeProvider as NextThemesProvider } from "next-themes";
import "@/styles/globals.css";
import {Route, Routes, useNavigate} from "react-router-dom";
import HomePage from "./components/HomePage";

export default function App() {
    const navigate = useNavigate()

    return (
        <NextUIProvider navigate={navigate}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* ... */}
            </Routes>
        </NextUIProvider>
    );
}


