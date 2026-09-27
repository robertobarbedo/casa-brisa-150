"use client";

import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Navigation,
  Sun,
  SunMedium,
  type LucideProps,
} from "lucide-react";
import { intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ceuDoCodigo } from "@/lib/agora/contexto";
import { formatarHora, FUSO, HORA, inicioDoDia } from "@/lib/agora/tempo-local";
import type { Previsao } from "@/lib/agora/tipos";
import { useAgora } from "@/lib/agora/use-agora";

type Props = {
  lang: Locale;
  tempo: Previsao["tempo"];
  textos: Dictionary["bemVindos"]["tempo"];
  ceu: Dictionary["agora"]["ceu"];
};

const HORAS_A_FRENTE = 12;

/** Ícone do tempo pelo código WMO do Open-Meteo. */
function IconeTempo({ codigo, ...props }: LucideProps & { codigo: number }) {
  if (codigo >= 95) return <CloudLightning {...props} />;
  if (codigo >= 51) return <CloudRain {...props} />;
  if (codigo >= 45) return <CloudFog {...props} />;
  if (codigo >= 3) return <Cloud {...props} />;
  if (codigo >= 1) return <CloudSun {...props} />;
  return <Sun {...props} />;
}

/** Agora, próximas horas e próximos dias. Tudo a partir da hora do celular. */
export function PainelTempo({ lang, tempo, textos, ceu }: Props) {
  const agora = useAgora();

  if (!tempo) return <p className="rounded-3xl bg-sol-suave/60 p-4 text-sm">{textos.indisponivel}</p>;
  if (!agora) return <div aria-hidden className="h-96 animate-pulse rounded-3xl bg-sol-suave/60" />;

  const { atual } = tempo;
  const horas = tempo.horas.filter((h) => h.t > agora - HORA && h.t <= agora + HORAS_A_FRENTE * HORA);
  const hoje = inicioDoDia(agora);
  const dias = tempo.dias.filter((d) => d.t >= hoje);
  const uvHoje = dias[0]?.uvMax ?? 0;

  const nomeDoDia = (t: number) => {
    if (t === hoje) return textos.hoje;
    if (t === hoje + 24 * HORA) return textos.amanha;
    const dia = new Intl.DateTimeFormat(intlLocale[lang], { weekday: "long", timeZone: FUSO }).format(t + 12 * HORA);
    return dia.replace("-feira", ""); // "terça-feira" → "terça": cabe na linha
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Agora */}
      <section className="rounded-3xl bg-linear-to-br from-sol-suave to-azul-suave p-5 text-taupe-escuro">
        <p className="text-xs font-bold tracking-wide uppercase opacity-80">
          {textos.agora} · {formatarHora(agora, lang)}
        </p>
        <div className="mt-2 flex items-center gap-4">
          <IconeTempo codigo={atual.codigo} aria-hidden className="size-14 shrink-0 text-sol" strokeWidth={1.5} />
          <div>
            <p className="text-5xl leading-none font-bold">{Math.round(atual.temp)}°</p>
            <p className="mt-1 font-bold first-letter:uppercase">{ceu[ceuDoCodigo(atual.codigo)]}</p>
          </div>
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-branco/70 px-3 py-1 text-sm font-bold">
          {/* A seta aponta para onde o vento vai (a direção informada é de onde ele vem). */}
          <Navigation
            aria-hidden
            className="size-3.5"
            style={{ transform: `rotate(${atual.ventoDirecao + 180 - 45}deg)` }}
          />
          {textos.vento} {Math.round(atual.vento)} km/h
        </p>
        {uvHoje >= 8 && (
          <p className="mt-3 flex items-start gap-2 text-sm">
            <SunMedium aria-hidden className="mt-0.5 size-4 shrink-0 text-sol" />
            {textos.uvAlto}
          </p>
        )}
      </section>

      {/* Próximas horas */}
      <section>
        <h2 className="text-sm font-bold text-taupe-escuro">{textos.proximasHoras}</h2>
        <ul className="sem-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
          {horas.map((h) => {
            return (
              <li
                key={h.t}
                className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-2xl bg-branco py-2.5 ring-1 ring-areia-escura/70"
              >
                <span className="text-xs font-bold">{formatarHora(h.t, lang)}</span>
                <IconeTempo codigo={h.codigo} aria-label={ceu[ceuDoCodigo(h.codigo)]} className="size-6 text-sol" />
                <span className="font-bold text-taupe-escuro">{Math.round(h.temp)}°</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                    h.chuvaProb >= 40 ? "text-azul-forte" : "opacity-40"
                  }`}
                >
                  <Droplets aria-hidden className="size-3" />
                  {h.chuvaProb}%
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Próximos dias */}
      <section>
        <h2 className="text-sm font-bold text-taupe-escuro">{textos.proximosDias}</h2>
        <ul className="mt-2 flex flex-col divide-y divide-areia-escura/70 rounded-3xl bg-branco px-4 ring-1 ring-areia-escura/70">
          {dias.map((d) => {
            return (
              <li key={d.t} className="flex items-center gap-3 py-3">
                <span className="w-20 shrink-0 font-bold text-taupe-escuro first-letter:uppercase">
                  {nomeDoDia(d.t)}
                </span>
                <IconeTempo codigo={d.codigo} aria-label={ceu[ceuDoCodigo(d.codigo)]} className="size-6 shrink-0 text-sol" />
                <span
                  className={`inline-flex w-12 shrink-0 items-center gap-0.5 text-xs font-bold ${
                    d.chuvaProb >= 40 ? "text-azul-forte" : "opacity-40"
                  }`}
                  aria-label={`${textos.chuva} ${d.chuvaProb}%`}
                >
                  <Droplets aria-hidden className="size-3.5" />
                  {d.chuvaProb}%
                </span>
                <span className="ml-auto text-right">
                  <span className="opacity-60">{Math.round(d.min)}°</span>
                  <span className="mx-1 opacity-40">/</span>
                  <span className="font-bold text-taupe-escuro">{Math.round(d.max)}°</span>
                </span>
                <span
                  className={`w-12 shrink-0 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold ${
                    d.uvMax >= 8 ? "bg-sol-suave text-sol" : "bg-areia text-taupe"
                  }`}
                >
                  {textos.uv} {Math.round(d.uvMax)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-xs opacity-70">{textos.fonte}</p>
    </div>
  );
}
