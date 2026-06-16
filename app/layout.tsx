import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Poppins,
  Bricolage_Grotesque,
  Space_Mono,
  Bangers,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ToastHost } from "./components/Toast";

// Neo-brutalist manga landing type system (see CLAUDE.md §3).
// Raw font-family CSS vars are named --ff-* so the Tailwind theme tokens
// (--font-clash etc. in globals.css) can reference them without recursion,
// and so font-clash never collides with the legacy .font-display (Bricolage).
// Clash is loaded from discrete weight files for true Bold glyphs.
const clashDisplay = localFont({
  src: [
    { path: "./fonts/ClashDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/ClashDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/ClashDisplay-Semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/ClashDisplay-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--ff-clash",
  display: "swap",
});

const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-Variable.ttf", style: "normal" },
    { path: "./fonts/GeneralSans-VariableItalic.ttf", style: "italic" },
  ],
  variable: "--ff-general",
  weight: "400 700",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--ff-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const bangers = Bangers({
  variable: "--ff-bangers",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-chubbo",
  weight: ["200", "400", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verse Sensei",
  description: "Learn from the minds of your heroes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${bricolage.variable} ${clashDisplay.variable} ${generalSans.variable} ${spaceMono.variable} ${bangers.variable} antialiased snap-container`}
      >
        {children}
        {/* Toasts */}
        <ToastHost />
      </body>
    </html>
  );
}
