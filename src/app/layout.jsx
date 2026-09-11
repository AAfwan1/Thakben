"use client";

import "./globals.css";
import { usePathname } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MapSection from "@/components/MapSection";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="en">
      <body>
        {!isAdmin && <Navbar />}

        <main>{children}</main>

        {!isAdmin && <MapSection />}
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}