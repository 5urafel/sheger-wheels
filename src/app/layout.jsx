import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Addis Wheels — Premium Car Rental & Chauffeur Services in Addis Ababa",
  description:
    "Rent reliable SUVs, 4x4 safaris, and economy sedans in Addis Ababa with instant Bole Airport pickup, comprehensive insurance, and 24/7 roadside assistance.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
