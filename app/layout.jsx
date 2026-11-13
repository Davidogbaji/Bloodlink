import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import ServiceWorkerRegister from "./ServiceWorkerRegister";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { isDemo } from "../lib/supabaseClient";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bloodlink-ten-zeta.vercel.app";
const DESCRIPTION =
  "See which hospitals in Nasarawa State hold which blood groups, live. Expiry countdowns, power-cut warnings and one-tap WhatsApp alerts to matching donors.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BloodLink ColdChain | Live Blood Stock for Nasarawa Hospitals",
    template: "%s | BloodLink ColdChain",
  },
  description: DESCRIPTION,
  applicationName: "BloodLink ColdChain",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "BloodLink ColdChain",
    title: "BloodLink ColdChain",
    description: DESCRIPTION,
    url: "/",
    locale: "en_NG",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BloodLink ColdChain: live blood stock for Nasarawa hospitals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BloodLink ColdChain",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport = {
  themeColor: "#2A0710",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
        >
          Skip to Content
        </a>
        <ServiceWorkerRegister />
        {isDemo && (
          <div role="status" className="bg-[#2A0710] px-4 py-2 text-center text-sm text-white">
            Demo mode: showing sample hospitals and donors, not real stock.
          </div>
        )}
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
