import { intlLocale, type Locale } from "@/i18n/config";

/** Moeda em que o visitante vê os preços. A reserva é sempre cobrada em reais. */
export type Moeda = "BRL" | "USD";

/** Cookie da moeda: o proxy grava pelo país na primeira visita, o botão R$/US$ troca. */
export const MOEDA_COOKIE = "moeda";

export const ehMoeda = (valor: unknown): valor is Moeda => valor === "BRL" || valor === "USD";

/** Valor em reais convertido pela taxa (reais por dólar), formatado como "US$ 120" ou "$120" conforme o idioma. */
export function formatUSD(valorBRL: number, taxa: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(valorBRL / taxa);
}
