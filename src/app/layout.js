// src/app/layout.js
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "Sheggar Wheels | Peer-to-Peer Car Rental in Addis Ababa",
  description: "Rent unique cars from trusted local hosts in Addis Ababa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b1320] text-gray-100 antialiased min-h-screen flex flex-col justify-between">
        <AppProvider>
          <Suspense fallback={<div className="h-16 bg-[#0b1320] border-b border-gray-800" />}>
            <Navbar />
          </Suspense>
          <main className="flex-grow">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}