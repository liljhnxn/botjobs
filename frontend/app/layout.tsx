import type { Metadata } from "next";
import "./globals.css";
import { Web3Providers } from "../components/Web3Providers";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "BotJobs | Decentralized Web3 Jobs & Talent Marketplace on Botchain",
  description:
    "BotJobs connects clients and Web3 talent through transparent, blockchain-powered hiring on Botchain Mainnet.",
  icons: {
    icon: [
      { url: "/botjobs_pfp.jpg" },
      { url: "/favicon.ico" },
    ],
    apple: "/botjobs_pfp.jpg",
    shortcut: "/botjobs_pfp.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-[#090B10] text-slate-100 antialiased"
        suppressHydrationWarning
      >
        <Web3Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </Web3Providers>
      </body>
    </html>
  );
}
