"use client";

import Link from "next/link";
import { localeLabel, locales, type Locale } from "@/i18n/config";
import { lembrarIdioma } from "@/lib/bem-vindos/idioma";

/** Troca de idioma compacta do menu do /bem-vindos (para quem tocou no idioma errado). */
export function SeletorIdioma({ lang, aria }: { lang: Locale; aria: string }) {
  return (
    <nav aria-label={aria} className="flex shrink-0 rounded-full bg-areia p-0.5 text-[11px] font-bold">
      {locales.map((l) => (
        <Link
          key={l}
          href={`/${l}/bem-vindos`}
          hrefLang={l}
          onClick={() => lembrarIdioma(l)}
          aria-current={l === lang ? "true" : undefined}
          className={`grid h-7 min-w-8 place-items-center rounded-full px-1.5 transition-colors ${
            l === lang ? "bg-branco text-taupe-escuro shadow-sm" : "text-taupe/70"
          }`}
        >
          {localeLabel[l]}
        </Link>
      ))}
    </nav>
  );
}
