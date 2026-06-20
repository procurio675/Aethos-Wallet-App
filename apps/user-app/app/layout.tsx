import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "PayFlow — Send Money, Instantly",
  description:
    "The modern digital wallet for India. Send, receive, and manage money with bank-grade security and instant settlements.",
  keywords: ["wallet", "payments", "UPI", "money transfer", "fintech", "India"],
  openGraph: {
    title: "PayFlow — Send Money, Instantly",
    description: "The modern digital wallet for India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", geistSans.variable, geistMono.variable)}>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
