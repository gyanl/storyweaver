import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ShareButton } from "@/components/ShareButton";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Storyweaver",
  description: "Interactive story generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} antialiased bg-[#3b4041] text-[#e9e6f5]`}
      >
        {/* Fixed Header with Logo */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#111] to-transparent pointer-events-none">
          <div className="p-4 flex justify-between items-center pointer-events-auto">
            <Link
              href="/"
              className="inline-block text-orange-500 hover:text-orange-400 transition-colors font-bold tracking-[0.2em] text-lg"
            >
              STORYWEAVER
            </Link>
            <ShareButton />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
