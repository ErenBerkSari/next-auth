"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Profil yükleniyor...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-5">

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profil Resmi"
              className="w-24 h-24 rounded-full border-4 border-blue-200 mb-4"
            />
          )}
          <h2 className="text-xl font-semibold text-gray-800">
            {session.user?.name || "İsimsiz Kullanıcı"}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              E-posta
            </label>
            <p className="text-gray-800">{session.user?.email || "E-posta bilgisi yok"}</p>
          </div>

          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kullanıcı ID
            </label>
            <p className="text-gray-800 font-mono text-sm">
              {session.user?.id || "ID bilgisi yok"}
            </p>
          </div>

          <div className="border-b border-gray-200 pb-3">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Oturum Durumu
            </label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Aktif
            </span>
          </div>

          <div className="pt-4">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}