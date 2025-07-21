import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ahon Montalban",
  description: "A community-driven platform for flood monitoring and assistance in the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="max-w-lg mx-auto bg-white min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}