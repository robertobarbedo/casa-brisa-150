import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/config/site";

/** Páginas do site; cada uma existe em todos os idiomas. */
const caminhos = ["", "/reservar"];

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
