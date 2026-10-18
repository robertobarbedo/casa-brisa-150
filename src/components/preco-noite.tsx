"use client";

import type { Locale } from "@/i18n/config";
import type { Cotacao } from "@/lib/cotacao";
import { SeletorMoeda, useMoeda } from "@/components/moeda";

type Props = {
  lang: Locale;
  cotacao: Cotacao | null;
  diaria: number;
  aPartirDe: string;
  porNoite: string;
  moedaAria: string;
};

/**
 * Diária da barra de reserva, na moeda escolhida. O botão R$/US$ fica na linha
 * do "a partir de", para o preço e o botão de reservar não se espremerem no celular.
 */
export function PrecoNoite({ lang, cotacao, diaria, aPartirDe, porNoite, moedaAria }: Props) {
  const { moeda, preco, setMoeda } = useMoeda(lang, cotacao);
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="whitespace-nowrap text-xs text-taupe/80">{aPartirDe}</p>
        {cotacao && <SeletorMoeda moeda={moeda} setMoeda={setMoeda} aria={moedaAria} />}
      </div>
      <p className="whitespace-nowrap text-taupe-escuro">
        <span className="text-lg font-extrabold">{preco(diaria)}</span>
        <span className="text-sm"> / {porNoite}</span>
      </p>
    </>
  );
}
