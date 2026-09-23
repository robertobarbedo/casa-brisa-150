import Link from "next/link";
import { localeLabel, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Logo } from "./logo";

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="sticky top-0 z-30 border-b border-areia-escura/60 bg-branco/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={`/${lang}`} className="flex items-center gap-2">
          <Logo className="size-8 shrink-0" />
          <span className="text-lg font-bold tracking-tight text-taupe-escuro">Casa Brisa</span>
        </Link>

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
      </div>
    </header>
  );
}
