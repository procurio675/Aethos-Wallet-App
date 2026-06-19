import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Bank",
  description: "Dummy payment gateway for wallet app development.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
