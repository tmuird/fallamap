import AppNavbar from "../components/Navbar.tsx";
import { Link } from "@nextui-org/link";

export default function DefaultLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex flex-col h-screen">
            <AppNavbar />
            <main className="container mx-auto max-w-7xl px-6 flex-grow">
                {children}
            </main>
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
        </div>
    );
}
