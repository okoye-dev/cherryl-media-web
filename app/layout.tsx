import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/config/site";
import { Hanken_Grotesk } from "next/font/google";
import localFont from "next/font/local";

const display = localFont({
  src: [
    {
      path: "./fonts/area/AreaNormal-Hairline.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/area/AreaNormal-Extralight.otf",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "./fonts/area/AreaNormal-ExtralightItalic.otf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const numerals = Hanken_Grotesk({
  subsets: ["latin"],
  weight: "200",
  variable: "--font-num",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logo-circle.webp", type: "image/webp" },
      { url: "/brand/logo-circle.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/brand/logo-circle.png",
        width: 600,
        height: 600,
        alt: "Cherryl Media Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE.name,
    description: SITE.description,
    creator: "@cherrylmedia",
    images: ["/brand/logo-circle.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Sentient (Fontshare, free for commercial use): the italic display serif, in its thinnest weight (Extra Light) */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=sentient@200,201&display=swap"
        />
      </head>
      <body className={`${display.variable} ${numerals.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
