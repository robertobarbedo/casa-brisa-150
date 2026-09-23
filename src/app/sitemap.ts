import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/config/site";

/** Páginas indexáveis; cada uma existe em todos os idiomas.
 *  /reservar fica de fora de propósito: é noindex. */
const caminhos = [""];

export default function sitemap(): MetadataRoute.Sitemap {
  return caminhos.flatMap((caminho) =>
    locales.map((lang) => ({
      url: `${siteUrl}/${lang}${caminho}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}${caminho}`]),
        ),
      },
    })),
  );
}
