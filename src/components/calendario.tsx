"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Info, Mail, Minus, Plus, RotateCcw } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { intlLocale } from "@/i18n/config";
import type { Casa } from "@/lib/casa";
import type { Dictionary } from "@/i18n/get-dictionary";
import { calcularOrcamento, listarNoites, type TabelaPrecos } from "@/lib/precos";
import { fill, formatBRL } from "@/lib/format";

const MESES_VISIVEIS = 12;

const iso = (d: Date) => d.toISOString().slice(0, 10);
const paraData = (s: string) => new Date(`${s}T00:00:00Z`);

type Props = {
  lang: Locale;
  dict: Dictionary;
  casa: Casa;
  ocupadas: string[];
  tabela: TabelaPrecos;
};

export function Calendario({ lang, dict, casa, ocupadas, tabela }: Props) {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hospedes, setHospedes] = useState(2);
  const [infoHospedes, setInfoHospedes] = useState(false);

  const ocupadasSet = useMemo(() => new Set(ocupadas), [ocupadas]);
  const hoje = iso(new Date());

  const meses = useMemo(() => {
    const agora = new Date();
    return Array.from({ length: MESES_VISIVEIS }, (_, i) => {
      const inicio = new Date(Date.UTC(agora.getFullYear(), agora.getMonth() + i, 1));
      const diasNoMes = new Date(
        Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, 0),
      ).getUTCDate();
      const dias = Array.from({ length: diasNoMes }, (_, d) =>
        iso(new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), d + 1))),
      );
      return { inicio, vazios: inicio.getUTCDay(), dias };
    });
  }, []);

  const nomeMes = (d: Date) =>
    new Intl.DateTimeFormat(intlLocale[lang], { month: "long", year: "numeric", timeZone: "UTC" })
      .format(d);

  const diasSemana = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(intlLocale[lang], { weekday: "short", timeZone: "UTC" });
    // 04/01/1970 foi um domingo
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(1970, 0, 4 + i))).slice(0, 3));
  }, [lang]);

  /** Um dia pode ser escolhido como entrada se a noite estiver livre. */
  const podeSerEntrada = (dia: string) => dia >= hoje && !ocupadasSet.has(dia);

  /** Como saída, todas as noites entre a entrada e ele precisam estar livres. */
  const podeSerSaida = (dia: string) =>
    !!checkIn && dia > checkIn && listarNoites(checkIn, dia).every((n) => !ocupadasSet.has(n));

  const selecionar = (dia: string) => {
    if (!checkIn || checkOut) {
      if (!podeSerEntrada(dia)) return;
      setCheckIn(dia);
      setCheckOut(null);
      return;
    }
    if (dia <= checkIn) {
      if (podeSerEntrada(dia)) setCheckIn(dia);
      return;
    }
    if (podeSerSaida(dia)) setCheckOut(dia);
  };

  const limpar = () => {
    setCheckIn(null);
    setCheckOut(null);
  };

  const orcamento = checkIn && checkOut ? calcularOrcamento(casa, tabela, checkIn, checkOut) : null;
  const noitesInsuficientes = !!orcamento && orcamento.noites < orcamento.minimoNoites;
  const pronto = !!orcamento && !noitesInsuficientes;

  const dataCurta = (s: string) =>
    new Intl.DateTimeFormat(intlLocale[lang], { day: "2-digit", month: "short", timeZone: "UTC" })
      .format(paraData(s));

  const dataLonga = (s: string) =>
    new Intl.DateTimeFormat(intlLocale[lang], { dateStyle: "long", timeZone: "UTC" })
      .format(paraData(s));

  const mensagem =
    checkIn && checkOut && orcamento
      ? fill(dict.reserva.mensagemPedido, {
          checkIn: dataLonga(checkIn),
          checkOut: dataLonga(checkOut),
          noites: orcamento.noites,
          hospedes,
          total: formatBRL(orcamento.total, lang),
        })
      : "";

  const assunto = checkIn && checkOut
    ? fill(dict.reserva.assuntoEmail, { checkIn: dataCurta(checkIn), checkOut: dataCurta(checkOut) })
    : "";

  const [paraEmail, ...copiaEmail] = casa.contato.emails;
  const linkEmail = `mailto:${paraEmail}?${copiaEmail.length ? `cc=${copiaEmail.join(",")}&` : ""}subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
  const linkWhats = `https://wa.me/${casa.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`;

  return (
    <div className="pb-8">
      {/* Resumo das datas escolhidas */}
      <div className="sticky top-14 z-20 -mx-4 mb-2 border-b border-areia-escura bg-branco/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {(["checkIn", "checkOut"] as const).map((campo) => {
            const valor = campo === "checkIn" ? checkIn : checkOut;
            const ativo = campo === "checkIn" ? !checkIn || !!checkOut : !!checkIn && !checkOut;
            return (
              <div
                key={campo}
                className={`flex-1 rounded-2xl border px-3 py-2 ${
                  ativo ? "border-terracota bg-terracota-suave/50" : "border-areia-escura"
                }`}
              >
                <p className="text-[11px] font-semibold tracking-wide uppercase text-taupe/80">
                  {dict.reserva[campo]}
                </p>
                <p className="font-bold text-taupe-escuro">
                  {valor ? dataCurta(valor) : "—"}
                </p>
              </div>
            );
          })}
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={limpar}
              aria-label={dict.reserva.limpar}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-areia text-taupe-escuro active:scale-95"
            >
              <RotateCcw className="size-5" />
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-taupe/80">
          {!checkIn || checkOut ? dict.reserva.toqueEntrada : dict.reserva.toqueSaida}
        </p>
        <ul className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-taupe/70">
          {diasSemana.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>

      {/* Meses */}
      <div className="space-y-6">
        {meses.map(({ inicio, vazios, dias }) => (
          <section key={iso(inicio)}>
            <h2 className="mb-2 font-bold text-taupe-escuro first-letter:uppercase">
              {nomeMes(inicio)}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: vazios }, (_, i) => <span key={`v${i}`} />)}
              {dias.map((dia) => {
                const passado = dia < hoje;
                const ocupada = ocupadasSet.has(dia);
                const ehEntrada = dia === checkIn;
                const ehSaida = dia === checkOut;
                const noIntervalo = !!checkIn && !!checkOut && dia > checkIn && dia < checkOut;
                const indisponivel =
                  passado || (checkIn && !checkOut ? !podeSerSaida(dia) && !podeSerEntrada(dia) : ocupada);

                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={indisponivel}
                    onClick={() => selecionar(dia)}
                    aria-label={dataLonga(dia)}
                    aria-pressed={ehEntrada || ehSaida}
                    className={`grid h-11 place-items-center rounded-xl text-sm font-semibold transition ${
                      ehEntrada || ehSaida
                        ? "bg-terracota-forte text-branco"
                        : noIntervalo
                          ? "bg-terracota-suave text-taupe-escuro"
                          : indisponivel
                            ? "text-taupe/25 line-through"
                            : "text-taupe-escuro active:bg-areia"
                    }`}
                  >
                    {Number(dia.slice(8))}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Hóspedes + resumo + envio */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-areia-escura bg-branco/95 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-taupe-escuro">
            {dict.reserva.hospedes}
            <button
              type="button"
              onClick={() => setInfoHospedes((v) => !v)}
              aria-expanded={infoHospedes}
              aria-controls="info-hospedes"
              aria-label={dict.reserva.hospedesInfoAria}
              className="grid size-6 place-items-center rounded-full text-taupe/70 active:scale-95"
            >
              <Info aria-hidden className="size-4" />
            </button>
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHospedes((n) => Math.max(1, n - 1))}
              disabled={hospedes <= 1}
              aria-label="−"
              className="grid size-11 place-items-center rounded-full border border-areia-escura disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center text-lg font-bold text-taupe-escuro">{hospedes}</span>
            <button
              type="button"
              onClick={() => setHospedes((n) => Math.min(casa.capacidade.hospedes, n + 1))}
              disabled={hospedes >= casa.capacidade.hospedes}
              aria-label="+"
              className="grid size-11 place-items-center rounded-full border border-areia-escura disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {infoHospedes && (
          <p id="info-hospedes" className="mt-2 rounded-2xl bg-areia px-3 py-2 text-xs leading-relaxed">
            {fill(dict.reserva.hospedesInfo, { n: casa.capacidade.hospedes })}
          </p>
        )}

        {orcamento && (
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>{fill(dict.reserva.noites, { n: orcamento.noites })}</dt>
              <dd>{formatBRL(orcamento.subtotal, lang)}</dd>
            </div>
            {orcamento.desconto > 0 && (
              <div className="flex justify-between font-semibold text-folha">
                <dt>{fill(dict.reserva.desconto, { n: casa.precos.descontoPercentual })}</dt>
                <dd>−{formatBRL(orcamento.desconto, lang)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>{dict.reserva.limpeza}</dt>
              <dd>{formatBRL(orcamento.limpeza, lang)}</dd>
            </div>
            <div className="flex justify-between border-t border-areia-escura pt-2 text-base font-bold text-taupe-escuro">
              <dt>{dict.reserva.total}</dt>
              <dd>{formatBRL(orcamento.total, lang)}</dd>
            </div>
          </dl>
        )}

        {noitesInsuficientes && (
          <p className="mt-3 rounded-2xl bg-terracota-suave px-3 py-2 text-sm text-terracota-forte">
            {fill(dict.reserva.minimoAviso, { n: orcamento.minimoNoites })}
          </p>
        )}

        <div className="mt-4 grid gap-2">
          {casa.contato.whatsapp && (
            <a
              href={pronto ? linkWhats : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!pronto}
              className={`grid min-h-13 place-items-center rounded-full px-4 py-2 text-center text-sm leading-tight font-bold transition sm:text-base ${
                pronto
                  ? "bg-[#25D366] text-white active:scale-95"
                  : "pointer-events-none bg-areia text-taupe/50"
              }`}
            >
              {dict.reserva.enviarWhatsapp}
            </a>
          )}
          {paraEmail && (
            <a
              href={pronto ? linkEmail : undefined}
              aria-disabled={!pronto}
              className={`flex min-h-13 items-center justify-center gap-2 rounded-full px-4 py-2 text-center text-sm leading-tight font-bold transition sm:text-base ${
                pronto
                  ? "bg-terracota-forte text-branco active:scale-95"
                  : "pointer-events-none bg-areia text-taupe/50"
              }`}
            >
              <Mail aria-hidden className="size-5 shrink-0" />
              {dict.reserva.enviarEmail}
            </a>
          )}
          {!casa.contato.whatsapp && !paraEmail && (
            <p className="rounded-2xl bg-areia px-4 py-3 text-center text-sm">
              <CalendarDays className="mx-auto mb-1 size-5" />
              {dict.reserva.semContato}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
