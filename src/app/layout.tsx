import type { Metadata } from "next";
import { Hanken_Grotesk, Newsreader, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pampa Estudio — Pilates & Yoga",
  description:
    "Reservá tus clases de Pilates y Yoga. Elegí tu pack, reservá tu lugar y disfrutá.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${hankenGrotesk.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#FFF7ED" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Pampa" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
