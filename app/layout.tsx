import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Manrope } from "next/font/google";
import "./globals.css";

// Display: Manrope (headings, KPIs). Interface/body: IBM Plex Sans.
// latin-ext covers Turkish (ğ, ş, ı, İ).
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Orvalot — Ajanslar için performans raporlama",
    template: "%s · Orvalot",
  },
  description:
    "Orvalot, ajansların yönettiği markaların reklam, satış ve analiz verilerini tek, berrak bir panelde birleştirir.",
  applicationName: "Orvalot",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1614" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${manrope.variable} ${plex.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
