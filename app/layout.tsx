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

// Neo-brutalist manga landing type system (see CLAUDE.md §3)
const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.ttf",
  variable: "--font-clash",
  weight: "400 700",
  display: "swap",
});

const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-Variable.ttf", style: "normal" },
    { path: "./fonts/GeneralSans-VariableItalic.ttf", style: "italic" },
  ],
  variable: "--font-general",
  weight: "400 700",
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const bangers = Bangers({
  variable: "--font-bangers",
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
