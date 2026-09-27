import type { Metadata } from "next";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateMetadata({ params }: LayoutProps<"/[lang]/bem-vindos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.bemVindos.meta,
    // Página para quem já está hospedado (QR code dos cartazes): fora do Google.
    robots: { index: false, follow: false },
  };
}

export default function BemVindosLayout({ children }: LayoutProps<"/[lang]/bem-vindos">) {
  return children;
}
