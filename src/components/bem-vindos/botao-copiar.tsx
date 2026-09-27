"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function BotaoCopiar({ texto, rotulo, copiado }: { texto: string; rotulo: string; copiado: string }) {
  const [feito, setFeito] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setFeito(true);
      setTimeout(() => setFeito(false), 2000);
    } catch {
      // Sem permissão de área de transferência: o texto continua visível para copiar à mão.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-areia px-3 text-xs font-bold text-taupe-escuro transition active:scale-95"
    >
      {feito ? <Check aria-hidden className="size-4 text-folha-forte" /> : <Copy aria-hidden className="size-4" />}
      {feito ? copiado : rotulo}
    </button>
  );
}
