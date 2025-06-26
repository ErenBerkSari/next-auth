"use client";
import { signIn, signOut } from "next-auth/react";
import { useAuth } from '../hooks/useAuth';

export default function UserBox() {
  const { session, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-xl p-10 max-w-sm w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Hoşgeldiniz</h1>
      {!isAuthenticated && (
        <p className="text-gray-500 mb-4">Devam etmek için giriş yapın</p>
      )}
      {isAuthenticated ? (
        <>
          <div className="text-lg text-gray-700">
            Merhaba, <span className="font-semibold">{session?.user?.name}</span>
          </div>
          <div className="text-sm text-gray-600">{session?.user?.email}</div>
          <button 
            onClick={() => signOut()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 active:scale-95 transition text-lg flex items-center gap-2 shadow cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
            </svg>
            Çıkış Yap
          </button>
        </>
      ) : (
        <button 
          onClick={() => signIn("auth0")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 active:scale-95 transition text-lg flex items-center gap-2 shadow-2xl cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
          Giriş Yap
        </button>
      )}
    </div>
  );
} 