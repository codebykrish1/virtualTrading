import "./globals.css";
import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import NavClient from "./components/NavClient";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  let isAuthenticated = false;

  try {
    const { getUser, isAuthenticated: checkAuth } = getKindeServerSession();
    isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      user = await getUser();
    }
  } catch {
    // Kinde not configured or error — show default nav
  }

  return (
    <html lang="en">
      <body className="bg-[#0d0d0d] min-h-screen text-white">
        <nav className="bg-[#0d0d0d] border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M3 17l4-8 4 4 4-6 4 10H3z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">VirtualTrade</span>
            </Link>

            {/* Client-side nav (active link highlighting) + auth buttons */}
            <NavClient isAuthenticated={isAuthenticated} user={user} />
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
