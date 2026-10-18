"use client";

import type { Locale } from "@/i18n/config";
import type { Cotacao } from "@/lib/cotacao";
import { SeletorMoeda, useMoeda } from "@/components/moeda";

type Props = {
  lang: Locale;
  cotacao: Cotacao | null;
  diaria: number;
  porNoite: string;
  moedaAria: string;
};

/** Diária da barra de reserva, na moeda escolhida, com o botão R$/US$. */
export function PrecoNoite({ lang, cotacao, diaria, porNoite, moedaAria }: Props) {
  const { moeda, preco, setMoeda } = useMoeda(lang, cotacao);
  return (
    <div className="flex items-center gap-2 text-taupe-escuro">
      <p>
        <span className="text-lg font-extrabold">{preco(diaria)}</span>
        <span className="text-sm"> / {porNoite}</span>
      </p>
      {cotacao && <SeletorMoeda moeda={moeda} setMoeda={setMoeda} aria={moedaAria} />}
    </div>
  );
}
