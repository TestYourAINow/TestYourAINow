import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TestYourAInow",
  description: "Build and share your AI agents with a single link. No coding. No hassle. Just results.",
  
  // Open Graph pour l'aperçu social (Facebook, WhatsApp, etc.)
  openGraph: {
    title: "TestYourAInow",
    description: "Turn your AI prompt into interactive demos — in minutes",
    url: "https://testyourainow.com",
    siteName: "TestYourAInow",
    images: [
      {
        url: "https://testyourainow.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "TestYourAInow - Build and share your AI agents with a single link. No coding. No hassle. Just results.",
      },
    ],
    type: "website",
  },
  
  // Twitter Cards pour l'aperçu sur Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "TestYourAInow",
    description: "Build and share your AI agents with a single link. No coding. No hassle. Just results.",
    images: ["https://testyourainow.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}