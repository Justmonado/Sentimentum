import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Sentimentum — Analizador léxico-emocional",
  description:
    "Indicadores de apoyo emocional basados en análisis léxico. No sustituye atención profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={`${plusJakarta.variable} min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}
