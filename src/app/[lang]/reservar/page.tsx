import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { alternativas } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { buscarNoitesOcupadas } from "@/lib/disponibilidade";
import { buscarCotacaoDolar } from "@/lib/cotacao";
import { carregarTabelaPrecos, recortarFuturo } from "@/lib/tabela-precos";
import { Header } from "@/components/header";
import { Calendario } from "@/components/calendario";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reservar">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    alternates: alternativas(lang, "/reservar"),
    // Calendário sem conteúdo próprio: todo o sinal fica na home.
    robots: { index: false, follow: true },
  };
}

// Disponibilidade: iCal do Airbnb (revalidado a cada 15 min).
// Preços: public/prices.csv, exportado do PriceLabs.
export default async function Reservar({ params }: PageProps<"/[lang]/reservar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, ocupadas, tabela, cotacao] = await Promise.all([
    getDictionary(lang),
    buscarNoitesOcupadas(),
    carregarTabelaPrecos(),
    buscarCotacaoDolar(),
  ]);

  return (
    <>
      <Header lang={lang} dict={dict} fechar={{ href: `/${lang}`, aria: dict.reserva.fechar }} />
      <main className="mx-auto max-w-md px-4">
        <h1 className="sr-only">{dict.reserva.titulo}</h1>
        <Calendario
          lang={lang}
          dict={dict}
          casa={casa}
          ocupadas={ocupadas}
          tabela={recortarFuturo(tabela)}
          cotacao={cotacao}
        />
      </main>
    </>
  );
}
