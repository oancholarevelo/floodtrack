import type { Metadata, Viewport } from "next"; // Import Viewport
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ahon Montalban",
  description: "A community-driven platform for flood monitoring and assistance in Rodriguez, Rizal.",
};

// FIX: Moved viewport settings to its own exported const
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <div className="max-w-lg mx-auto bg-white min-h-screen shadow-2xl shadow-slate-200">
          {children}
        </div>
      </body>
    </html>
  );
}