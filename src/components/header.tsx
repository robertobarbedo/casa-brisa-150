import Link from "next/link";
import { X } from "lucide-react";
import { localeLabel, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Logo } from "./logo";

type Props = {
  lang: Locale;
  dict: Pick<Dictionary, "nav">;
  /** Em vez dos idiomas, um X que fecha a página (ex.: /reservar, onde o calendário precisa do espaço). */
  fechar?: { href: string; aria: string };
};

export function Header({ lang, dict, fechar }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-areia-escura/60 bg-branco/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <Logo className="size-8 shrink-0" />
          <span className="text-lg font-bold tracking-tight text-taupe-escuro">Casa Brisa</span>
        </Link>

        {fechar ? (
          <Link
            href={fechar.href}
            aria-label={fechar.aria}
            className="grid size-10 place-items-center rounded-full bg-areia text-taupe-escuro active:scale-95"
          >
            <X aria-hidden className="size-5" />
          </Link>
        ) : (
          <nav aria-label={dict.nav.idioma} className="flex rounded-full bg-areia p-1 text-xs font-bold">
            {locales.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                hrefLang={l}
                aria-current={l === lang ? "true" : undefined}
                className={`grid h-8 min-w-10 place-items-center rounded-full px-2 transition-colors ${
                  l === lang ? "bg-branco text-taupe-escuro shadow-sm" : "text-taupe/70"
                }`}
              >
                {localeLabel[l]}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
