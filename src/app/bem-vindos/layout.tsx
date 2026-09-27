import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";

/**
 * Raiz própria só para a escolha de idioma do QR code (/bem-vindos).
 * Ainda não há idioma, então esta página não passa pelo layout [lang].
 */
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Casa Brisa · Bem-vindos · Bienvenidos · Welcome",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#fbf9f6", viewportFit: "cover" };

export default function EscolhaLayout({ children }: LayoutProps<"/bem-vindos">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
