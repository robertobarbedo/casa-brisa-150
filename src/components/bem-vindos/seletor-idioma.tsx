"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { localeLabel, localeNome, locales, type Locale } from "@/i18n/config";
import { lembrarIdioma } from "@/lib/bem-vindos/idioma";

/**
 * Troca de idioma compacta do menu do /bem-vindos (para quem tocou no idioma errado):
 * um botão pequeno que abre a lista, para não disputar espaço com o título.
 */
export function SeletorIdioma({ lang, aria }: { lang: Locale; aria: string }) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Fecha ao tocar fora ou com Esc.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  return (
    <div ref={raiz} className="relative shrink-0">
      <button
        type="button"
        aria-label={aria}
        aria-expanded={aberto}
        aria-haspopup="true"
        onClick={() => setAberto((a) => !a)}
        className="flex h-8 items-center gap-1 rounded-full bg-areia pr-2 pl-3 text-[11px] font-bold text-taupe-escuro transition active:scale-95"
      >
        {localeLabel[lang]}
        <ChevronDown aria-hidden className={`size-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
      </button>

      {aberto && (
        <nav
          aria-label={aria}
          className="absolute top-full right-0 z-20 mt-2 w-44 rounded-2xl bg-branco p-1.5 shadow-suave ring-1 ring-areia-escura/60"
        >
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}/bem-vindos`}
              hrefLang={l}
              onClick={() => {
                lembrarIdioma(l);
                setAberto(false);
              }}
              aria-current={l === lang ? "true" : undefined}
              className={`flex h-10 items-center justify-between rounded-xl px-3 text-sm ${
                l === lang ? "bg-areia font-bold text-taupe-escuro" : "text-taupe-escuro"
              }`}
            >
              {localeNome[l]}
              {l === lang && <Check aria-hidden className="size-4" />}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
