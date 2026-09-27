"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Cloud, CloudRain, Moon, Sun, Sunset, Waves, type LucideIcon } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { montarContexto } from "@/lib/agora/contexto";
import { escolherMensagens, type TextosAgora } from "@/lib/agora/motor";
import { formatarHora } from "@/lib/agora/tempo-local";
import type { Ceu, Destino, Periodo, Previsao } from "@/lib/agora/tipos";
import { useAgora } from "@/lib/agora/use-agora";

type Props = {
  lang: Locale;
  previsao: Previsao;
  local: { latitude: number; longitude: number };
  whatsapp: string;
  textos: TextosAgora & { rotulo: string; proxima: string };
  mare: { alta: string; baixa: string };
};

/** Cada período do dia tem sua cor; à noite a faixa escurece (sem precisar dizer nada). */
const tema: Record<Periodo, { fundo: string; icone: LucideIcon; chip: string }> = {
  manha: { fundo: "bg-linear-to-br from-azul-suave to-branco text-taupe-escuro", icone: Sun, chip: "bg-branco/80" },
  tarde: { fundo: "bg-linear-to-br from-areia to-azul-suave text-taupe-escuro", icone: Sun, chip: "bg-branco/70" },
  porDoSol: {
    fundo: "bg-linear-to-br from-[#f8d9bf] via-terracota-suave to-[#e9b5a2] text-taupe-escuro",
    icone: Sunset,
    chip: "bg-branco/60",
  },
  anoitecer: {
    fundo: "bg-linear-to-br from-[#d9c6cf] to-azul text-taupe-escuro",
    icone: Moon,
    chip: "bg-branco/50",
  },
  noite: { fundo: "bg-linear-to-br from-noite to-[#3a4a5a] text-branco", icone: Moon, chip: "bg-branco/15" },
};

const iconeCeu: Record<Ceu, LucideIcon> = { sol: Sun, nublado: Cloud, chuva: CloudRain };

export function FaixaAgora({ lang, previsao, local, whatsapp, textos, mare }: Props) {
  const agora = useAgora();
  const [indice, setIndice] = useState(0);

  const ctx = useMemo(() => (agora ? montarContexto(agora, previsao, local) : null), [agora, previsao, local]);
  const mensagens = useMemo(() => (ctx ? escolherMensagens(ctx, lang, textos) : []), [ctx, lang, textos]);

  // Antes de saber a hora (página estática), reserva o espaço para não pular.
  if (!ctx || mensagens.length === 0) {
    return <div aria-hidden className="h-44 animate-pulse rounded-3xl bg-areia/70" />;
  }

  const atual = mensagens[indice % mensagens.length];
  const { fundo, icone: Icone, chip } = tema[ctx.periodo];
  const hrefDe = (d: Destino) => (d === "whatsapp" ? `https://wa.me/${whatsapp}` : `/${lang}/bem-vindos/${d}`);

  const chips: { icone: LucideIcon; texto: string }[] = [];
  if (ctx.proximaMare) {
    const rotulo = ctx.proximaMare.tipo === "alta" ? mare.alta : mare.baixa;
    chips.push({ icone: Waves, texto: `${rotulo} ${formatarHora(ctx.proximaMare.t, lang)}` });
  }
  if (ctx.minAtePorDoSol > 0) chips.push({ icone: Sunset, texto: formatarHora(ctx.porDoSol, lang) });
  if (ctx.tempo) chips.push({ icone: iconeCeu[ctx.tempo.ceu], texto: `${ctx.tempo.temp}°` });

  const texto = (
    <span key={atual.id} className="entrar block text-xl leading-snug font-bold text-balance">
      {atual.texto}
      {atual.destino && <ArrowRight aria-hidden className="ml-1.5 inline size-5 align-[-3px] opacity-70" />}
    </span>
  );

  return (
    <section aria-live="polite" className={`relative overflow-hidden rounded-3xl p-5 shadow-suave ${fundo}`}>
      <Icone aria-hidden className="absolute -top-4 -right-4 size-28 opacity-15" strokeWidth={1.25} />

      <p className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase opacity-80">
        <span className="size-2 animate-pulse rounded-full bg-current" />
        {textos.rotulo} · {formatarHora(ctx.agora, lang)}
      </p>

      <div className="mt-2 min-h-[3.75rem]">
        {atual.destino ? (
          atual.destino === "whatsapp" ? (
            <a href={hrefDe(atual.destino)} target="_blank" rel="noopener noreferrer" className="block">
              {texto}
            </a>
          ) : (
            <Link href={hrefDe(atual.destino)} className="block">
              {texto}
            </Link>
          )
        ) : (
          texto
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <ul className="flex flex-wrap gap-1.5 text-xs font-bold">
          {chips.map(({ icone: I, texto }) => (
            <li key={texto} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${chip}`}>
              <I aria-hidden className="size-3.5" />
              {texto}
            </li>
          ))}
        </ul>

        {mensagens.length > 1 && (
          <button
            type="button"
            onClick={() => setIndice((i) => (i + 1) % mensagens.length)}
            aria-label={textos.proxima}
            className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full pr-2 pl-3 text-xs font-bold transition active:scale-95 ${chip}`}
          >
            {(indice % mensagens.length) + 1}/{mensagens.length}
            <ChevronRight aria-hidden className="size-4" />
          </button>
        )}
      </div>
    </section>
  );
}
