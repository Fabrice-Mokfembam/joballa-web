import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { Fraunces, Inter } from "next/font/google";
import { JOBALLA_THEME_INIT_SCRIPT } from "@/lib/theme/joballa-theme";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Remixa (from `public/fonts/`) — marketing nav, auth brand panel, OTP labels. */
const remixa = localFont({
  src: [
    { path: "../public/fonts/remixa-test-cdnfonts/RemixaTest-Regular-BF649a5c12202eb.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/remixa-test-cdnfonts/RemixaTest-Medium-BF649a5c122165d.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/remixa-test-cdnfonts/RemixaTest-Semibold-BF649a5c1233077.otf", weight: "600", style: "normal" },
    { path: "../public/fonts/remixa-test-cdnfonts/RemixaTest-Bold-BF649a5c11cf16c.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-remixa",
  display: "swap",
});

/** Display type for auth aside wordmark / tagline. */
const joballaDisplay = Fraunces({
  subsets: ["latin"],
  variable: "--font-joballa-display",
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Joballa",
  description:
    "Joballa connects workers, employers, and admins in one bilingual hiring platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${remixa.variable} ${joballaDisplay.variable}`} suppressHydrationWarning>
      <head>
        {/* Blocking inline script in a Server Component — avoids React 19 warning from next/script (client). */}
        <Script
          id="joballa-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JOBALLA_THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
