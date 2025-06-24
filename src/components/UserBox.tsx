"use client";
import { useUser } from '@auth0/nextjs-auth0/client';

export default function UserBox() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Hoşgeldiniz</h1>
      {user ? (
        <>
          <div className="text-lg text-gray-700">Merhaba, <span className="font-semibold">{user.name}</span></div>
          <a className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-lg" href="/api/auth/logout">Çıkış Yap</a>
        </>
      ) : (
        <a className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-lg" href="/api/auth/login">Giriş Yap</a>
      )}
    </div>
  );
} 