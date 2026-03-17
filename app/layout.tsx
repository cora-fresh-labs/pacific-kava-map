import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pacific Kava Map — Interactive Explorer",
  description:
    "Explore kava varieties, growing regions, cultural significance, and market data across the Pacific. Interactive map powered by AI.",
  openGraph: {
    title: "Pacific Kava Map",
    description: "Interactive kava explorer — varieties, culture, markets across the Pacific",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a1628] text-white`}>{children}</body>
    </html>
  );
}
