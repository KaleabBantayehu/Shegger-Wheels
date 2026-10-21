import { plus_jakarta_sans } from "./ui/font.js";
import "./globals.css";
import Navbar from "../components/NavBar.jsx";

export const metadata = {
  title: 'Sheggar Wheels - Car Rental & Marketplace',
  description: 'Rent, buy, and list vehicles seamlessly in Ethiopia.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${plus_jakarta_sans.className}} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}</body>
    </html>
  );
}

