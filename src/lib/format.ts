import { intlLocale, type Locale } from "@/i18n/config";

/** Substitui {chave} no texto: fill("{n} quartos", { n: 3 }) → "3 quartos" */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function formatBRL(value: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "BRL",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}
