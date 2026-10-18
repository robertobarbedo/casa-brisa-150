"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";
import type { Cotacao } from "@/lib/cotacao";
import { formatBRL } from "@/lib/format";
import { ehMoeda, formatUSD, MOEDA_COOKIE, type Moeda } from "@/lib/moeda";

const ouvintes = new Set<() => void>();

function lerCookie(): Moeda {
  const valor = document.cookie.match(new RegExp(`(?:^|; )${MOEDA_COOKIE}=([^;]*)`))?.[1];
  return ehMoeda(valor) ? valor : "BRL";
}

function gravarMoeda(moeda: Moeda) {
  document.cookie = `${MOEDA_COOKIE}=${moeda}; path=/; max-age=31536000; samesite=lax`;
  ouvintes.forEach((avisar) => avisar());
}

/**
 * Moeda escolhida (cookie) e o formatador de preços. As páginas são estáticas,
 * então o HTML sai em reais e troca para dólar ao carregar, se for o caso.
 * Sem cotação, fica sempre em reais.
 */
export function useMoeda(lang: Locale, cotacao: Cotacao | null) {
  const escolhida = useSyncExternalStore(
    (avisar) => {
      ouvintes.add(avisar);
      return () => ouvintes.delete(avisar);
    },
    lerCookie,
    () => "BRL" as Moeda,
  );
  const moeda: Moeda = cotacao ? escolhida : "BRL";

  const preco = (valorBRL: number) =>
    moeda === "USD" && cotacao ? formatUSD(valorBRL, cotacao.valor, lang) : formatBRL(valorBRL, lang);

  return { moeda, preco, setMoeda: gravarMoeda };
}

type Props = {
  moeda: Moeda;
  setMoeda: (moeda: Moeda) => void;
  aria: string;
};

/** Botão R$ | US$. */
export function SeletorMoeda({ moeda, setMoeda, aria }: Props) {
  return (
    <div role="group" aria-label={aria} className="inline-flex rounded-full bg-areia p-0.5 text-xs font-bold">
      {(["BRL", "USD"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMoeda(m)}
          aria-pressed={moeda === m}
          className={`rounded-full px-2.5 py-1 transition ${
            moeda === m ? "bg-branco text-taupe-escuro shadow-sm" : "text-taupe/70"
          }`}
        >
          {m === "BRL" ? "R$" : "US$"}
        </button>
      ))}
    </div>
  );
}
