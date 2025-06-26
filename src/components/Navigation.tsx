"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  return (
    <nav
      className={`w-full flex flex-col sm:flex-row items-center px-4 sm:px-8 py-4 bg-gray-50 shadow-md ${session ? "sm:justify-between" : "sm:justify-center"}`}
    >
      <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
        <Link className={`text-gray-800 font-bold ${session ? "text-xl" : "text-3xl"}`} href="/">
          NextAuth App
        </Link>
      </div>
      {session && (
        <div className="flex gap-2 sm:gap-4">
          <Link
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-medium hover:bg-blue-100 hover:text-blue-700 border border-transparent hover:border-blue-400 transition shadow-sm"
            href="/profile"
          >
            Profil
          </Link>
          {Array.isArray(session.user?.role) && session.user.role.includes('admin') && (
            <Link className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-medium shadow-sm" href="/admin">
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
} 