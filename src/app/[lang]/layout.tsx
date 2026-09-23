import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, intlLocale, locales, type Locale } from "@/i18n/config";
import { alternativas, siteUrl } from "@/config/site";
import { casa } from "@/lib/casa";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#fbf9f6",
  viewportFit: "cover",
};

/** OpenGraph exige language_TERRITORY: "pt" puro é malformado. */
const ogLocale = (lang: Locale) => intlLocale[lang].replace("-", "_");

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: alternativas(lang),
    openGraph: {
      type: "website",
      siteName: casa.nome,
      // og:url não é herdado da canônica; sem isto a tag simplesmente some.
      url: `/${lang}`,
      locale: ogLocale(lang),
      alternateLocale: locales.filter((l) => l !== lang).map(ogLocale),
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: dict.og.imagem }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={lang === "pt" ? "pt-BR" : lang} className={`${nunito.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
