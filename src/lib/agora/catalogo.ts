import type { Contexto, Regra } from "./tipos";
import { mareBaixaPerto, marePerto } from "./contexto";
import { HORA, inicioDoDia } from "./tempo-local";

/**
 * Catálogo de mensagens da faixa "Agora".
 *
 * Cada regra diz QUANDO a mensagem vale e QUAIS valores ela mostra.
 * O texto fica nos dicionários, em agora.mensagens.<id>, como lista de
 * variações ({hora}, {min}, {temp}... são preenchidos aqui).
 *
 * Para criar uma mensagem nova:
 *   1. acrescente a regra aqui;
 *   2. acrescente agora.mensagens.<id> em pt.json, es.json, en.json e ru.json.
 *
 * Tom: recado de anfitrião, só o que é bom para o hóspede. Nada de regras
 * da casa (lixo, janelas, silêncio, check-out): isso fica nos cartazes.
 *
 * Prioridade: hora marcada (pôr do sol) > tempo > maré > dicas gerais.
 */

const h = (hora: number) => hora * 60; // minuto do dia

export const catalogo: Regra[] = [
  // ── Pôr do sol ──────────────────────────────────────────────
  {
    id: "porDoSolJa",
    prioridade: 100,
    quando: (c) => c.minAtePorDoSol > 0 && c.minAtePorDoSol <= 20,
    valores: (c) => ({ min: c.minAtePorDoSol }),
    destino: "passeios",
  },
  {
    id: "porDoSolMangue",
    grupo: "mare",
    prioridade: 90,
    quando: (c) =>
      c.minAtePorDoSol > 20 && c.minAtePorDoSol <= 90 && !!mareBaixaPerto(c, c.porDoSol, 1.5 * HORA),
    destino: "passeios",
  },
  {
    id: "porDoSol",
    prioridade: 85,
    quando: (c) => c.minAtePorDoSol > 20 && c.minAtePorDoSol <= 90,
    valores: (c) => ({ hora: { hora: c.porDoSol } }),
    destino: "passeios",
  },

  // ── Tempo ───────────────────────────────────────────────────
  {
    // Sugestão de almoço só das 10h30 às 14h; das 15h às 21h, jantar.
    id: "chovendo",
    prioridade: 80,
    quando: (c) => !!c.tempo?.chovendo && c.minutoDoDia >= h(10.5) && c.minutoDoDia < h(14),
    destino: "comer",
  },
  {
    id: "chovendoNoite",
    prioridade: 80,
    quando: (c) => !!c.tempo?.chovendo && c.minutoDoDia >= h(15) && c.minutoDoDia < h(21),
    destino: "comer",
  },
  {
    id: "chuvaMaisTarde",
    prioridade: 75,
    quando: (c) =>
      !!c.tempo && !c.tempo.chovendo && c.tempo.chuvaEm !== null && c.minutoDoDia >= h(7) && c.minutoDoDia < h(17),
    valores: (c) => ({ hora: { hora: c.tempo!.chuvaEm! } }),
    destino: "tempo",
  },

  // ── Maré ────────────────────────────────────────────────────
  {
    id: "mareBaixa",
    grupo: "mare",
    prioridade: 70,
    quando: (c) => {
      if (c.minutoDoDia < h(6) || c.minAtePorDoSol <= 90) return false;
      const baixa = mareBaixaPerto(c, c.agora + 1.25 * HORA, 1.75 * HORA); // de -30 min a +3 h
      return !!baixa && baixa.t < c.porDoSol;
    },
    valores: (c) => ({ hora: { hora: mareBaixaPerto(c, c.agora + 1.25 * HORA, 1.75 * HORA)!.t } }),
    destino: "passeios",
  },

  {
    // Na maré alta a faixa de areia encolhe: em dia cheio, falta lugar.
    id: "mareAlta",
    grupo: "mare",
    prioridade: 65,
    quando: (c) =>
      c.diaDeMovimento &&
      c.minutoDoDia >= h(8) &&
      c.minutoDoDia < h(16) &&
      !c.tempo?.chovendo &&
      !!proximaAlta(c),
    valores: (c) => ({ hora: { hora: proximaAlta(c)!.t } }),
    destino: "praia",
  },

  // ── Dicas do dia ────────────────────────────────────────────
  {
    id: "ceuLimpo",
    prioridade: 60,
    quando: (c) =>
      c.minutoDoDia >= h(14) &&
      c.minAtePorDoSol > 90 &&
      c.minAtePorDoSol <= 240 &&
      c.tempo?.nuvensPorDoSol != null &&
      c.tempo.nuvensPorDoSol < 25 &&
      !c.tempo.chovendo,
    valores: (c) => ({ hora: { hora: c.porDoSol } }),
    destino: "passeios",
  },
  {
    id: "uvAlto",
    prioridade: 55,
    quando: (c) => (c.tempo?.uvMax ?? 0) >= 8 && c.minutoDoDia >= h(7) && c.minutoDoDia < h(11),
    destino: "praia",
  },
  {
    id: "calor",
    prioridade: 50,
    quando: (c) => (c.tempo?.temp ?? 0) >= 30 && c.minutoDoDia >= h(11) && c.minAtePorDoSol > 0,
    valores: (c) => ({ temp: c.tempo!.temp }),
    destino: "casa",
  },

  // ── Noite ("amanhã" só até a meia-noite, depois vira "hoje") ───
  {
    id: "amanhaComMare",
    grupo: "mare",
    prioridade: 46,
    quando: (c) => !!c.tempo?.amanha && c.minutoDoDia >= h(20.5) && !!baixaDeAmanha(c),
    valores: (c) => ({
      ceu: { ceu: c.tempo!.amanha!.ceu },
      max: c.tempo!.amanha!.max,
      hora: { hora: baixaDeAmanha(c)!.t },
    }),
    destino: "praia",
  },
  {
    id: "amanha",
    prioridade: 45,
    quando: (c) => !!c.tempo?.amanha && c.minutoDoDia >= h(20.5) && !baixaDeAmanha(c),
    valores: (c) => ({ ceu: { ceu: c.tempo!.amanha!.ceu }, max: c.tempo!.amanha!.max }),
    destino: "tempo",
  },
  {
    id: "fome",
    prioridade: 40,
    quando: (c) => c.minAtePorDoSol <= 0 && c.minutoDoDia < h(21.5) && c.minutoDoDia >= h(12),
    destino: "comer",
  },

  // ── Padrão de cada período ──────────────────────────────────
  {
    id: "bomDia",
    prioridade: 30,
    quando: (c) => c.minutoDoDia >= h(5) && c.minutoDoDia < h(11),
    destino: "perto",
  },
  {
    id: "tarde",
    prioridade: 30,
    quando: (c) => c.minutoDoDia >= h(11) && c.minAtePorDoSol > 90,
    destino: "praia",
  },
  {
    id: "boaNoite",
    prioridade: 30,
    quando: (c) => c.minutoDoDia >= h(21.5) || c.minutoDoDia < h(5),
    destino: "whatsapp",
  },
  {
    id: "bemVindo",
    prioridade: 0,
    quando: () => true,
  },
];

/** Maré alta nas próximas 3 h ("chegar antes" só faz sentido antes dela). */
const proximaAlta = (c: Contexto) => marePerto(c, "alta", c.agora + 1.5 * HORA, 1.5 * HORA);

/** Primeira maré baixa de amanhã entre 6h e 18h. */
function baixaDeAmanha(c: Contexto) {
  const amanha6h = inicioDoDia(c.agora) + 30 * HORA;
  return c.mares.find((m) => m.tipo === "baixa" && m.t >= amanha6h && m.t <= amanha6h + 12 * HORA) ?? null;
}
