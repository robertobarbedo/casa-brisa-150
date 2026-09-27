import type { Ceu, Contexto, EventoMare, Periodo, Previsao } from "./tipos";
import { solDoDia } from "./sol";
import { HORA, inicioDoDia, MINUTO, minutoDoDia } from "./tempo-local";

/** Códigos WMO do Open-Meteo agrupados no que importa para o hóspede. */
export function ceuDoCodigo(codigo: number): Ceu {
  if (codigo >= 51) return "chuva"; // garoa, chuva, pancadas, trovoadas
  if (codigo >= 2) return "nublado"; // parcialmente nublado, nublado, neblina
  return "sol";
}

/**
 * Marés altas e baixas a partir da série horária: cada pico/vale local,
 * refinado por uma parábola nos 3 pontos vizinhos (dá precisão de minutos).
 */
export function eventosDeMare(serie: { t: number; nivel: number }[]): EventoMare[] {
  const eventos: EventoMare[] = [];
  for (let i = 1; i < serie.length - 1; i++) {
    const [a, b, c] = [serie[i - 1].nivel, serie[i].nivel, serie[i + 1].nivel];
    const alta = b > a && b >= c;
    const baixa = b < a && b <= c;
    if (!alta && !baixa) continue;

    const curvatura = a - 2 * b + c;
    const desvio = curvatura === 0 ? 0 : (a - c) / (2 * curvatura); // em horas, entre -0,5 e 0,5
    eventos.push({
      tipo: alta ? "alta" : "baixa",
      t: serie[i].t + desvio * HORA,
      nivel: b - ((a - c) * desvio) / 4,
    });
  }
  return eventos;
}

function periodoDo(minuto: number, minAtePorDoSol: number): Periodo {
  if (minuto >= 22 * 60 || minuto < 5 * 60) return "noite";
  if (minAtePorDoSol <= 75 && minAtePorDoSol > -30) return "porDoSol";
  if (minAtePorDoSol <= -30) return "anoitecer";
  if (minuto < 12 * 60) return "manha";
  return "tarde";
}

export function montarContexto(
  agora: number,
  previsao: Previsao,
  local: { latitude: number; longitude: number },
): Contexto {
  const hoje = inicioDoDia(agora);
  // solDoDia espera a meia-noite UTC da mesma data (a local é 03:00 UTC).
  const diaUtc = hoje - (hoje % 86_400_000);
  const { nascer, porDoSol } = solDoDia(diaUtc, local.latitude, local.longitude);
  const minAtePorDoSol = Math.round((porDoSol - agora) / MINUTO);
  const minuto = minutoDoDia(agora);

  const mares = previsao.mare ? eventosDeMare(previsao.mare) : [];

  let tempo: Contexto["tempo"] = null;
  const p = previsao.tempo;
  if (p) {
    const hojeDia = p.dias.find((d) => d.t === hoje);
    const amanhaDia = p.dias.find((d) => d.t === hoje + 24 * HORA);
    const horaMaisPerto = (t: number) =>
      p.horas.reduce((m, h) => (Math.abs(h.t - t) < Math.abs(m.t - t) ? h : m), p.horas[0]);
    const chuvaFutura = p.horas.find((h) => h.t > agora && h.t <= agora + 6 * HORA && h.chuvaProb >= 60);

    tempo = {
      temp: Math.round(p.atual.temp),
      ceu: ceuDoCodigo(p.atual.codigo),
      chovendo: p.atual.chuva > 0.2 || ceuDoCodigo(p.atual.codigo) === "chuva",
      uvMax: hojeDia?.uvMax ?? 0,
      nuvensPorDoSol: p.horas.length ? horaMaisPerto(porDoSol).nuvens : null,
      chuvaEm: chuvaFutura?.t ?? null,
      amanha: amanhaDia ? { ceu: ceuDoCodigo(amanhaDia.codigo), max: Math.round(amanhaDia.max) } : null,
    };
  }

  return {
    agora,
    minutoDoDia: minuto,
    diaDoAno: Math.floor(hoje / (24 * HORA)),
    periodo: periodoDo(minuto, minAtePorDoSol),
    nascer,
    porDoSol,
    minAtePorDoSol,
    mares,
    proximaMare: mares.find((m) => m.t > agora) ?? null,
    tempo,
  };
}

/** Maré baixa dentro de ±janela de um instante (ex.: perto do pôr do sol). */
export const mareBaixaPerto = (ctx: Contexto, t: number, janela: number) =>
  ctx.mares.find((m) => m.tipo === "baixa" && Math.abs(m.t - t) <= janela) ?? null;
