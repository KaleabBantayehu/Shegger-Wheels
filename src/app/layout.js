import "./globals.css";
import Navbar from "../components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Sheggar Wheels | Peer-to-Peer Car Rental in Addis Ababa",
  description: "Rent unique cars from trusted local hosts in Addis Ababa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0b1320] text-gray-100 antialiased min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}