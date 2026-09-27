"use client";

import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpToLine, Sunrise, Sunset } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { eventosDeMare } from "@/lib/agora/contexto";
import { solDoDia } from "@/lib/agora/sol";
import { formatarHora, HORA, inicioDoDia } from "@/lib/agora/tempo-local";
import type { Previsao } from "@/lib/agora/tipos";
import { useAgora } from "@/lib/agora/use-agora";

type Props = {
  lang: Locale;
  mare: Previsao["mare"];
  local: { latitude: number; longitude: number };
  textos: Dictionary["bemVindos"]["mare"];
};

const L = 320; // largura do gráfico
const A = 110; // altura do gráfico

/** Curva da maré de hoje, com o "agora" marcado, e o sol do dia. */
export function PainelMare({ lang, mare, local, textos }: Props) {
  const agora = useAgora();

  const dia = useMemo(() => {
    if (!agora) return null;
    const inicio = inicioDoDia(agora);
    const fim = inicio + 24 * HORA;
    const sol = solDoDia(inicio - (inicio % (24 * HORA)), local.latitude, local.longitude);
    if (!mare) return { inicio, fim, sol, pontos: [], eventos: [] };

    const pontos = mare.filter((p) => p.t >= inicio && p.t <= fim);
    const eventos = eventosDeMare(mare).filter((e) => e.t >= inicio && e.t < fim);
    return { inicio, fim, sol, pontos, eventos };
  }, [agora, mare, local]);

  if (!agora || !dia) return <div aria-hidden className="h-64 animate-pulse rounded-3xl bg-azul-suave/60" />;

  const { inicio, pontos, eventos, sol } = dia;
  const niveis = pontos.map((p) => p.nivel);
  const min = Math.min(...niveis);
  const max = Math.max(...niveis);
  const x = (t: number) => ((t - inicio) / (24 * HORA)) * L;
  const y = (n: number) => 12 + (1 - (n - min) / (max - min || 1)) * (A - 24);
  const linha = pontos.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.nivel).toFixed(1)}`).join(" ");
  const nivelAgora = interpolar(pontos, agora);

  return (
    <section className="rounded-3xl bg-azul-suave/70 p-4">
      <h2 className="font-bold text-taupe-escuro">{textos.titulo}</h2>
      <ul className="mt-2 flex flex-col gap-1.5 text-sm text-pretty">
        <li className="flex gap-2">
          <ArrowDownToLine aria-hidden className="mt-0.5 size-4 shrink-0 text-azul-forte" />
          {textos.dicaBaixa}
        </li>
        <li className="flex gap-2">
          <ArrowUpToLine aria-hidden className="mt-0.5 size-4 shrink-0 text-azul-forte" />
          {textos.dicaAlta}
        </li>
      </ul>

      {pontos.length > 1 ? (
        <>
          <svg viewBox={`0 0 ${L} ${A}`} className="mt-6 w-full overflow-visible" role="img" aria-label={textos.titulo}>
            {/* Faixa da noite antes do nascer e depois do pôr do sol */}
            <rect x={0} y={0} width={Math.max(0, x(sol.nascer))} height={A} className="fill-noite/5" />
            <rect x={x(sol.porDoSol)} y={0} width={Math.max(0, L - x(sol.porDoSol))} height={A} className="fill-noite/5" />
            <path d={`${linha} L${L},${A} L0,${A} Z`} className="fill-azul/60" />
            <path d={linha} fill="none" strokeWidth={2.5} strokeLinejoin="round" className="stroke-azul-forte" />
            {nivelAgora !== null && (
              <g>
                <line x1={x(agora)} x2={x(agora)} y1={0} y2={A} strokeDasharray="3 3" className="stroke-terracota-forte" />
                <circle cx={x(agora)} cy={y(nivelAgora)} r={5} className="fill-terracota-forte stroke-branco" strokeWidth={2} />
                <text
                  x={x(agora)}
                  y={-4}
                  textAnchor="middle"
                  className="fill-terracota-forte text-[10px] font-bold uppercase"
                >
                  {textos.agora}
                </text>
              </g>
            )}
          </svg>

          <ul className="mt-3 grid grid-cols-2 gap-2">
            {eventos.map((e) => (
              <li
                key={e.t}
                className={`rounded-2xl bg-branco px-3 py-2 ${e.t < agora ? "opacity-50" : ""}`}
              >
                <span className="block text-xs font-bold uppercase text-azul-forte">
                  {e.tipo === "alta" ? textos.alta : textos.baixa}
                </span>
                <span className="text-lg font-bold text-taupe-escuro">{formatarHora(e.t, lang)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-2 text-sm">{textos.indisponivel}</p>
      )}

      <div className="mt-3 flex gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-branco px-3 py-1.5">
          <Sunrise aria-hidden className="size-4 text-terracota-forte" />
          {textos.nascer} {formatarHora(sol.nascer, lang)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-branco px-3 py-1.5">
          <Sunset aria-hidden className="size-4 text-terracota-forte" />
          {textos.porDoSol} {formatarHora(sol.porDoSol, lang)}
        </span>
      </div>

      <p className="mt-3 text-xs opacity-70">{textos.fonte}</p>
    </section>
  );
}

function interpolar(pontos: { t: number; nivel: number }[], t: number) {
  for (let i = 1; i < pontos.length; i++) {
    const [a, b] = [pontos[i - 1], pontos[i]];
    if (t >= a.t && t <= b.t) return a.nivel + ((t - a.t) / (b.t - a.t)) * (b.nivel - a.nivel);
  }
  return null;
}
