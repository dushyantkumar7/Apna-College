import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "VidyaLearn — Learn to Code for Free",
  description: "Course platform with structured playlists, progress tracking and an admin panel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Providers>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} VidyaLearn · Built with Next.js · Deploy on Vercel
          </footer>
        </Providers>
      </body>
    </html>
  );
}
