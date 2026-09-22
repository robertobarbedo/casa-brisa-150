export const locales = ["pt", "es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Locale usado por Intl (moeda, datas). */
export const intlLocale: Record<Locale, string> = {
  pt: "pt-BR",
  es: "es-AR",
  en: "en-US",
};

export const localeLabel: Record<Locale, string> = {
  pt: "PT",
  es: "ES",
  en: "EN",
};
