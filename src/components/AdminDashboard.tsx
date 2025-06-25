"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    } else if (status === "authenticated" && (!Array.isArray(session?.user?.role) || !session.user.role.includes("admin"))) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!session || !Array.isArray(session.user?.role) || !session.user.role.includes("admin")) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-red-600">Erişim Reddedildi</h1>
        <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Hoşgeldin, {session.user?.name}!
          </h2>
          <p className="text-gray-600">
            Rol: <span className="font-semibold text-blue-600">{Array.isArray(session.user?.role) ? session.user.role.join(', ') : session.user?.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* İstatistik Kartları */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Toplam Kullanıcı</h3>
            <p className="text-2xl font-bold text-blue-600">1,234</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Aktif Oturum</h3>
            <p className="text-2xl font-bold text-green-600">567</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Bugünkü Giriş</h3>
            <p className="text-2xl font-bold text-purple-600">89</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hızlı İşlemler</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Kullanıcı Yönetimi
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Sistem Ayarları
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              Logları Görüntüle
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
              Yedekleme
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
} 