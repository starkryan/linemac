import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalFooter } from "./components/ConditionalFooter";
import OfflineIndicator from "@/components/offline-indicator";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "UCL - Aadhaar Update Client Portal",
  description: "Secure portal for Aadhaar card correction and update requests with Better Auth authentication",
  openGraph: {
    title: "UCL - Aadhaar Update Client Portal",
    description: "Secure portal for Aadhaar card correction and update requests with Better Auth authentication",
    type: "website",
    locale: "en_IN",
    siteName: "UCL Portal",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "UCL - Aadhaar Update Client Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UCL - Aadhaar Update Client Portal",
    description: "Secure portal for Aadhaar card correction and update requests with Better Auth authentication",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "manifest", url: "/manifest.json" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "UCL Portal",
    "application-name": "UCL Portal",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased m-0 p-0`}
      >
        <div className="flex flex-col min-h-screen">
          <OfflineIndicator />
          <div className="flex-1">
            {children}
          </div>
          <ConditionalFooter />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
