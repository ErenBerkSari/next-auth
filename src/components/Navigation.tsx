"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  console.log("NAV SESSION", session);
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 bg-gray-50 shadow-md">
      <div className="flex items-center gap-4">
        <Link className="text-xl font-bold text-gray-800" href="/">
          NextAuth App
        </Link>
      </div>
      
      <div className="flex gap-4">
        {session ? (
          <>
            <Link
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 font-medium hover:bg-blue-100 hover:text-blue-700 border border-transparent hover:border-blue-400 transition shadow-sm"
              href="/profile"
            >
              Profil
            </Link>
            
            <Link
              className="px-4 py-2 rounded bg-red-500 text-white font-medium hover:bg-red-700 transition shadow-sm"
              href="/api/auth/signout"
            >
              Çıkış Yap
            </Link>
          </>
        ) : (
          <Link
            className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-800 transition shadow-sm"
            href="/api/auth/signin"
          >
            Giriş Yap
          </Link>
        )}
      </div>
    </nav>
  );
} 