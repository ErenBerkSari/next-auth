import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Providers from "@/components/Providers";
import Auth0Provider from "next-auth/providers/auth0";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NextAuth + Auth0 App",
  description: "NextAuth.js ile Auth0 entegrasyonu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen`}
      >
        <Providers session={session}>
          <main className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
              {children}
            </div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
