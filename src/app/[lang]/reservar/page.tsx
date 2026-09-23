import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { alternativas } from "@/config/site";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { buscarNoitesOcupadas } from "@/lib/disponibilidade";
import { carregarTabelaPrecos, recortarFuturo } from "@/lib/tabela-precos";
import { Header } from "@/components/header";
import { Calendario } from "@/components/calendario";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/reservar">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { alternates: alternativas(lang, "/reservar") };
}

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
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-taupe-escuro">
            {dict.reserva.titulo}
          </h1>
          <Link
            href={`/${lang}`}
            aria-label={dict.reserva.fechar}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-areia text-taupe-escuro active:scale-95"
          >
            <X aria-hidden className="size-5" />
          </Link>
        </div>
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
