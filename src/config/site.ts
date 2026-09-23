import { locales, type Locale } from "@/i18n/config";

/** Domínio público do site, usado nas URLs absolutas (canônica, hreflang, sitemap). */
export const siteUrl = "https://casabrisa150.com";

/**
 * Canônica e hreflang de uma página, para o `alternates` do metadata.
 * `caminho` é o trecho depois do idioma, ex.: "" (home) ou "/reservar".
 */
export function alternativas(lang: Locale, caminho = "") {
  return {
    canonical: `/${lang}${caminho}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `/${l}${caminho}`])),
      // Sem idioma preferido, o visitante cai na raiz e é levado ao idioma padrão.
      "x-default": caminho || "/",
    },
  };
}
