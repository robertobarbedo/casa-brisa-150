import type { Casa } from "@/lib/casa";

const UM_DIA = 86_400_000;

/** Preço e mínimo de noites por data, vindos do CSV do PriceLabs. */
export type TabelaPrecos = Record<string, { preco: number; minimo: number }>;

export type Orcamento = {
  noites: number;
  /** Soma das diárias base sem desconto */
  subtotalDiarias: number;
  /** Hóspedes além dos inclusos na diária */
  hospedesExtras: number;
  /** Taxa de hóspede extra de todas as noites, sem desconto */
  taxaHospedes: number;
  /** Diárias + taxa de hóspede extra, sem desconto */
  subtotal: number;
  desconto: number;
  /** Percentual de desconto aplicado (o de poucos hóspedes, quando vale) */
  descontoPercentual: number;
  /** Se o desconto aplicado é o de poucos hóspedes */
  descontoPoucosHospedes: boolean;
  /** Diárias e taxa de hóspede extra já com o desconto aplicado */
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
export function comDesconto(valor: number, casa: Casa, percentual = casa.precos.descontoPercentual) {
  return Math.round(valor * (1 - percentual / 100));
}

/** Desconto que vale para o número de hóspedes: o de poucos hóspedes ou o padrão. */
export function descontoParaHospedes(casa: Casa, hospedes: number) {
  const poucos = casa.precos.descontoPoucosHospedes;
  if (poucos && hospedes <= poucos.ateHospedes) {
    return { percentual: poucos.percentual, poucosHospedes: true };
  }
  return { percentual: casa.precos.descontoPercentual, poucosHospedes: false };
}

export function precoDaNoite(casa: Casa, tabela: TabelaPrecos, noite: string) {
  return tabela[noite]?.preco ?? casa.precos.diaria;
}

export function calcularOrcamento(
  casa: Casa,
  tabela: TabelaPrecos,
  checkIn: string,
  checkOut: string,
  hospedes: number,
): Orcamento {
  const noites = listarNoites(checkIn, checkOut);
  const subtotalDiarias = noites.reduce((soma, noite) => soma + precoDaNoite(casa, tabela, noite), 0);
  // Como no Airbnb: a taxa por hóspede extra entra na diária, então o desconto vale para ela também.
  const hospedesExtras = Math.max(0, hospedes - casa.precos.hospedesInclusos);
  const taxaHospedes = hospedesExtras * casa.precos.hospedeExtra * noites.length;
  const subtotal = subtotalDiarias + taxaHospedes;
  const descontoAplicado = descontoParaHospedes(casa, hospedes);
  const diarias = comDesconto(subtotal, casa, descontoAplicado.percentual);
  const limpeza = casa.precos.limpeza;

  // O mínimo de noites vale para a data de entrada, como no PriceLabs.
  const minimoNoites = tabela[checkIn]?.minimo ?? casa.precos.minimoNoites;

  return {
    noites: noites.length,
    subtotalDiarias,
    hospedesExtras,
    taxaHospedes,
    subtotal,
    desconto: subtotal - diarias,
    descontoPercentual: descontoAplicado.percentual,
    descontoPoucosHospedes: descontoAplicado.poucosHospedes,
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
