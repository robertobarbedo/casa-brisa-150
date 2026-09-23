import type { Casa } from "@/lib/casa";

const UM_DIA = 86_400_000;

/** Preço e mínimo de noites por data, vindos do CSV do PriceLabs. */
export type TabelaPrecos = Record<string, { preco: number; minimo: number }>;

export type Orcamento = {
  noites: number;
  /** Soma das diárias sem desconto */
  subtotal: number;
  desconto: number;
  /** Diárias já com o desconto aplicado */
  diarias: number;
  limpeza: number;
  total: number;
  minimoNoites: number;
  diariaMedia: number;
};

/** Lista as noites entre check-in e check-out (o dia da saída não conta). */
export function listarNoites(checkIn: string, checkOut: string): string[] {
  const noites: string[] = [];
  const fim = Date.parse(`${checkOut}T00:00:00Z`);
  for (let t = Date.parse(`${checkIn}T00:00:00Z`); t < fim; t += UM_DIA) {
    noites.push(new Date(t).toISOString().slice(0, 10));
  }
  return noites;
}

/** Aplica o desconto de reserva direta e arredonda para real inteiro. */
export function comDesconto(valor: number, casa: Casa) {
  return Math.round(valor * (1 - casa.precos.descontoPercentual / 100));
}

export function precoDaNoite(casa: Casa, tabela: TabelaPrecos, noite: string) {
  return tabela[noite]?.preco ?? casa.precos.diaria;
}

export function calcularOrcamento(
  casa: Casa,
  tabela: TabelaPrecos,
  checkIn: string,
  checkOut: string,
): Orcamento {
  const noites = listarNoites(checkIn, checkOut);
  const subtotal = noites.reduce((soma, noite) => soma + precoDaNoite(casa, tabela, noite), 0);
  const diarias = comDesconto(subtotal, casa);
  const limpeza = casa.precos.limpeza;

  // O mínimo de noites vale para a data de entrada, como no PriceLabs.
  const minimoNoites = tabela[checkIn]?.minimo ?? casa.precos.minimoNoites;

  return {
    noites: noites.length,
    subtotal,
    desconto: subtotal - diarias,
    diarias,
    limpeza,
    total: diarias + limpeza,
    minimoNoites,
    diariaMedia: noites.length ? Math.round(diarias / noites.length) : casa.precos.diaria,
  };
}

/** Menor diária (já com desconto) usada no "a partir de". */
export function menorDiaria(casa: Casa, tabela: TabelaPrecos) {
  const precos = Object.values(tabela).map((t) => t.preco);
  return comDesconto(precos.length ? Math.min(...precos) : casa.precos.diaria, casa);
}

/** Faixa de diárias (já com desconto), usada no priceRange do dado estruturado. */
export function faixaDiarias(casa: Casa, tabela: TabelaPrecos) {
  const precos = Object.values(tabela).map((t) => t.preco);
  if (!precos.length) {
    const unico = comDesconto(casa.precos.diaria, casa);
    return { min: unico, max: unico };
  }
  return {
    min: comDesconto(Math.min(...precos), casa),
    max: comDesconto(Math.max(...precos), casa),
  };
}
