import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "LoveLock — A Puzzle for Your Love",
  description:
    "Create a beautiful photo puzzle for your partner. They solve it to reveal your image and love message.",
  openGraph: {
    title: "LoveLock — A Puzzle for Your Love",
    description:
      "Create a beautiful photo puzzle for your partner. They solve it to reveal your image and love message.",
    type: "website",
  },
  other: {
    "theme-color": "#0f0a1e",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0f0a1e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0f0a1e]">
      <body className={`${inter.variable} ${playfair.variable} antialiased`} style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {children}
      </body>
    </html>
  );
}
