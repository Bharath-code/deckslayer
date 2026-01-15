import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CSPostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeckSlayer | Adversarial Pitch Deck Audit",
  description: "Stop guessing. Kill the delusion. The world's first adversarial pitch deck audit using the Multi-Agent A2A Protocol. Get the brutal truth before your lead partner meeting.",
  keywords: ["pitch deck", "startup", "VC", "venture capital", "pitch deck review", "AI audit", "fundraising", "investor feedback"],
  authors: [{ name: "DeckSlayer" }],
  creator: "DeckSlayer",
  metadataBase: new URL("https://deckslayer.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://deckslayer.com",
    siteName: "DeckSlayer",
    title: "DeckSlayer | Adversarial Pitch Deck Audit",
    description: "Your pitch deck is lying to you. Get the brutal truth from our AI Investment Committee before your lead partner meeting.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeckSlayer - Adversarial Pitch Deck Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeckSlayer | Adversarial Pitch Deck Audit",
    description: "Your pitch deck is lying to you. Get the brutal truth from our AI Investment Committee.",
    images: ["/og-image.png"],
    creator: "@deckslayer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CSPostHogProvider>
            {children}
          </CSPostHogProvider>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
