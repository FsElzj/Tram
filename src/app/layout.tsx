import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Entrar · Lidia Labs Links",
  description: "Enlaces cortos con métricas por país",
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: "#2b0709" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-neutral-950 text-neutral-100 antialiased font-sans">{children}</body>
    </html>
  );
}
