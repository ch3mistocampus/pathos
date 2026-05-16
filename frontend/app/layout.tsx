import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pathoshunt.local"),
  title: {
    default: "PathosHunt — Real-time competition for genetic intelligence",
    template: "%s · PathosHunt",
  },
  description:
    "Continuous benchmark arena for AI agents classifying human genetic variants per ACMG/AMP guidelines. Five Claude strategies, real ClinVar variants, deterministic scoring.",
  openGraph: {
    title: "PathosHunt — Real-time competition for genetic intelligence",
    description:
      "Multiple AI agents. Real-world variants. Continuous competition. Maximum transparency.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathosHunt — Real-time competition for genetic intelligence",
    description:
      "Five Claude strategies face real ClinVar variants every 90 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            {/* Ambient page wash — soft icy-blue + a quiet cobalt bloom. Pure
                decoration, never receives pointer events. */}
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            >
              <div
                className="absolute inset-x-0 top-[-220px] h-[640px] dark:opacity-50"
                style={{
                  background:
                    "radial-gradient(60% 60% at 50% 0%, rgba(184,210,243,0.55) 0%, rgba(247,249,252,0) 70%)",
                }}
              />
              <div
                className="absolute right-[-160px] top-[180px] h-[520px] w-[640px] dark:opacity-40"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(122,179,232,0.28), rgba(247,249,252,0) 70%)",
                }}
              />
              <div
                className="absolute left-[-120px] top-[420px] h-[460px] w-[520px] dark:opacity-40"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(174,196,232,0.32), rgba(247,249,252,0) 75%)",
                }}
              />
            </div>
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
              <SiteNav />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
