"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { evento, type NomeEvento } from "@/lib/analytics";

type Props = {
  children: React.ReactNode;
  mais: string;
  menos: string;
  /** Evento de analytics disparado ao expandir. */
  eventoAoAbrir?: NomeEvento;
};

/**
 * Lista que mostra só o começo e expande no botão. Os itens extras já vêm no HTML
 * (bom para o Google) e se escondem com `hidden group-data-[aberto=true]:flex`.
 * No desktop (md+) a lista aparece inteira e o botão some.
 */
export function VerMais({ children, mais, menos, eventoAoAbrir }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <div data-aberto={aberto} className="group">
      {children}
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => {
          if (!aberto && eventoAoAbrir) evento(eventoAoAbrir);
          setAberto(!aberto);
        }}
        className="mt-5 inline-flex min-h-11 md:hidden items-center gap-1.5 rounded-full border border-areia-escura px-4 text-sm font-bold text-taupe-escuro transition active:scale-95"
      >
        {aberto ? menos : mais}
        <ChevronDown aria-hidden className="size-4 transition-transform group-data-[aberto=true]:rotate-180" />
      </button>
    </div>
  );
}
