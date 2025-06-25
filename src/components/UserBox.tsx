"use client";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from '../hooks/useAuth';

export default function UserBox() {
  const { session, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Hoşgeldiniz</h1>
      {isAuthenticated ? (
        <>
          <div className="text-lg text-gray-700">
            Merhaba, <span className="font-semibold">{session?.user?.name}</span>
          </div>
          <div className="text-sm text-gray-600">{session?.user?.email}</div>
          <button 
            onClick={() => signOut()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-lg"
          >
            Çıkış Yap
          </button>
        </>
      ) : (
        <button 
          onClick={() => signIn("auth0")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-lg"
        >
          Giriş Yap
        </button>
      )}
    </div>
  );
} 