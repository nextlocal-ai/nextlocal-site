import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Mono, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["900"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "NextLocal AI — Get Found in AI Search",
  description:
    "AI optimization for local businesses. When customers ask ChatGPT, Perplexity, or Google AI who to call — we make sure your name comes up. Done-for-you service starting at $997/month.",
  openGraph: {
    title: "NextLocal AI — Get Found in AI Search",
    description:
      "AI optimization for local businesses. When customers ask ChatGPT, Perplexity, or Google AI who to call — we make sure your name comes up.",
    url: "https://nextlocal.ai",
    siteName: "NextLocal AI",
    locale: "en_US",
    type: "website",
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
        className={`${playfair.variable} ${ibmPlexMono.variable} ${dmSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
