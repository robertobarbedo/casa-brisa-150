"use client";

import { useSyncExternalStore } from "react";
import { ChevronRight } from "lucide-react";
import { locales, type Locale } from "@/i18n/config";
import { lembrarIdioma } from "@/lib/bem-vindos/idioma";

const opcoes: Record<Locale, { nome: string; ola: string }> = {
  pt: { nome: "Português", ola: "Olá!" },
  es: { nome: "Español", ola: "¡Hola!" },
  en: { nome: "English", ola: "Hello!" },
};

const nada = () => () => {};
/** Idioma do celular, só para destacar a opção provável (a escolha é sempre do hóspede). */
const idiomaDoCelular = () => navigator.language.slice(0, 2).toLowerCase();

export function EscolherIdioma() {
  const sugerido = useSyncExternalStore(nada, idiomaDoCelular, () => null);

  return (
    <ul className="mt-10 flex flex-col gap-3">
      {locales.map((l) => {
        const destaque = l === sugerido;
        return (
          <li key={l}>
            <a
              href={`/${l}/bem-vindos`}
              hrefLang={l}
              onClick={() => lembrarIdioma(l)}
              className={`flex h-16 items-center justify-between rounded-3xl px-5 transition active:scale-[0.97] ${
                destaque
                  ? "bg-terracota-forte text-branco shadow-suave"
                  : "bg-branco text-taupe-escuro ring-1 ring-areia-escura"
              }`}
            >
              <span>
                <span className="block text-lg font-bold">{opcoes[l].nome}</span>
                <span className={`block text-sm ${destaque ? "opacity-85" : "text-taupe/80"}`}>{opcoes[l].ola}</span>
              </span>
              <ChevronRight aria-hidden className="size-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
