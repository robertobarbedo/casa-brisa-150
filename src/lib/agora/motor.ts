import type { Locale } from "@/i18n/config";
import { fill } from "@/lib/format";
import { catalogo } from "./catalogo";
import { formatarHora } from "./tempo-local";
import type { Ceu, Contexto, Mensagem, Regra, Valor } from "./tipos";

/** Os textos da faixa, como vêm do dicionário (agora.*). */
export type TextosAgora = {
  ceu: Record<Ceu, string>;
  mensagens: Record<string, string[]>;
};

/** Mesma variação o dia todo; muda no dia seguinte (e difere entre mensagens). */
function variacao(opcoes: string[], id: string, diaDoAno: number) {
  let semente = diaDoAno;
  for (const letra of id) semente = (semente * 31 + letra.charCodeAt(0)) >>> 0;
  return opcoes[semente % opcoes.length];
}

function formatar(valor: Valor, lang: Locale, textos: TextosAgora): string {
  if (typeof valor !== "object") return String(valor);
  if ("hora" in valor) return formatarHora(valor.hora, lang);
  return textos.ceu[valor.ceu];
}

/**
 * Todas as mensagens que valem agora, da mais para a menos importante.
 * Regras sem texto no idioma são ignoradas (dá para lançar uma
 * mensagem aos poucos, um idioma de cada vez).
 */
export function escolherMensagens(
  ctx: Contexto,
  lang: Locale,
  textos: TextosAgora,
  regras: Regra[] = catalogo,
): Mensagem[] {
  return regras
    .filter((r) => textos.mensagens[r.id]?.length && r.quando(ctx))
    .sort((a, b) => b.prioridade - a.prioridade)
    .map((r) => {
      const valores = Object.fromEntries(
        Object.entries(r.valores?.(ctx) ?? {}).map(([k, v]) => [k, formatar(v, lang, textos)]),
      );
      const modelo = variacao(textos.mensagens[r.id], r.id, ctx.diaDoAno);
      return { id: r.id, texto: fill(modelo, valores), destino: r.destino };
    });
}
