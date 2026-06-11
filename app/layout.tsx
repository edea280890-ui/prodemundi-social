import type { Metadata } from "next";
import {
  Exo_2,
  Montserrat,
  Rajdhani,
} from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  subsets: ["latin"],
  variable: "--font-exo2",
  weight: ["400", "500", "600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PRODEMUNDI Social",
  description: "Plataforma premium de pronósticos deportivos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html
    lang="es"
    className={`
      ${exo2.variable}
      ${montserrat.variable}
      ${rajdhani.variable}
    `}
  >
    <body className="bg-[#050505] text-white">
      {children}
    </body>
  </html>
);
}