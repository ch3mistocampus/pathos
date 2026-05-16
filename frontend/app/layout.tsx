import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pathos.local"),
  title: {
    default: "Pathos — ACMG variant interpretation arena",
    template: "%s · Pathos",
  },
  description:
    "Continuous benchmark tournament for AI agents classifying human genetic variants per ACMG/AMP guidelines. Five Claude strategies, real ClinVar variants, deterministic scoring.",
  openGraph: {
    title: "Pathos — ACMG variant interpretation arena",
    description:
      "Five Claude strategies face real ClinVar variants every 90 seconds. Reasoning is first-class.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathos — ACMG variant interpretation arena",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
          <SiteNav />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
