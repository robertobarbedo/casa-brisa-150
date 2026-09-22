import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { buscarNoitesOcupadas } from "@/lib/disponibilidade";
import { carregarTabelaPrecos, recortarFuturo } from "@/lib/tabela-precos";
import { Header } from "@/components/header";
import { Calendario } from "@/components/calendario";

// Disponibilidade: iCal do Airbnb (revalidado a cada 15 min).
// Preços: public/prices.csv, exportado do PriceLabs.
export default async function Reservar({ params }: PageProps<"/[lang]/reservar">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, ocupadas, tabela] = await Promise.all([
    getDictionary(lang),
    buscarNoitesOcupadas(),
    carregarTabelaPrecos(),
  ]);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="mx-auto max-w-md px-4 pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-taupe-escuro">
          {dict.reserva.titulo}
        </h1>
        <Calendario
          lang={lang}
          dict={dict}
          casa={casa}
          ocupadas={ocupadas}
          tabela={recortarFuturo(tabela)}
        />
      </main>
    </>
  );
}
