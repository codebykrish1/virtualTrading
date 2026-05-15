"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  isAuthenticated: boolean;
  user: { given_name?: string | null; email?: string | null; picture?: string | null } | null;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/performance", label: "Performance" },
];

export default function NavClient({ isAuthenticated, user }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-4">
      {/* Nav links — only show when logged in */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-white bg-gray-800"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Auth section */}
      {isAuthenticated ? (
        <div className="flex items-center gap-3">
          {/* User avatar / name */}
          <div className="flex items-center gap-2">
            {user?.picture ? (
              <img src={user.picture} alt="avatar" className="w-8 h-8 rounded-full border border-gray-600" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {user?.given_name?.[0] ?? user?.email?.[0] ?? "U"}
              </div>
            )}
            <span className="text-sm text-gray-300 hidden sm:inline">
              {user?.given_name ?? user?.email ?? "User"}
            </span>
          </div>
          <a
            href="/api/auth/logout"
            className="text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-full transition-all"
          >
            Logout
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <a
            href="/api/auth/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign up
          </a>
          <a
            href="/api/auth/login"
            className="text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-full transition-all"
          >
            Log in
          </a>
        </div>
      )}
    </div>
  );
}
