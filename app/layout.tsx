import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saberes",
  description: "Página web para programa Saberes, El Quisco.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        
        <div className="flex-grow">{children}</div>
        
        <Footer />
      </body>
    </html>
  );
}