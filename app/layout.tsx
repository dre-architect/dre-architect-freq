import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import ErrorCapture from "@/components/ErrorCapture";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://freq-ai.vercel.app"),
  title: "FREQ AI — Autonomous Maritime Cargo Intelligence",
  description:
    "FREQ AI delivers autonomous maritime cargo intelligence, surveyed in minutes. Deployed at ADM Waggaman Terminal on the Mississippi River.",
  openGraph: {
    title: "FREQ AI — Autonomous Maritime Cargo Intelligence",
    description:
      "Autonomous maritime cargo intelligence, surveyed in minutes. Deployed at ADM Waggaman Terminal on the Mississippi River.",
    type: "website",
    locale: "en_US",
    siteName: "FREQ AI",
    images: [
      {
        url: "/og-card.png",
        width: 1200,
        height: 630,
        alt: "FREQ AI — Autonomous Maritime Cargo Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FREQ AI — Autonomous Maritime Cargo Intelligence",
    description:
      "Autonomous maritime cargo intelligence, surveyed in minutes.",
    images: ["/og-card.png"],
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
        className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorCapture />
        {children}
      </body>
    </html>
  );
}
