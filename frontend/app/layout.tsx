import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://raillens.vercel.app"),
  title: {
    default: "RailLens — Live Indian Railways status, schedules, PNR & station boards",
    template: "%s · RailLens",
  },
  description:
    "Track any Indian train live, check full schedules, station arrival and departure boards, trains between stations, and PNR status. Fast, free and built on public NTES data.",
  keywords: [
    "Indian Railways",
    "NTES",
    "live train status",
    "train running status",
    "PNR status",
    "train schedule",
    "station live board",
    "trains between stations",
  ],
  authors: [{ name: "RailLens" }],
  openGraph: {
    title: "RailLens — Live Indian Railways, in one place",
    description:
      "Live running status, schedules, station boards and PNR — fast and free.",
    type: "website",
    locale: "en_IN",
    siteName: "RailLens",
  },
  twitter: {
    card: "summary_large_image",
    title: "RailLens — Live Indian Railways, in one place",
    description: "Live running status, schedules, station boards and PNR.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-saffron focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-950"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
