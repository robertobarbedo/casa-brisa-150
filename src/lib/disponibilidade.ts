import "server-only";

/**
 * Lê o calendário iCal do Airbnb e devolve as noites ocupadas.
 * O Airbnb exporta tanto as reservas quanto os bloqueios manuais,
 * então basta bloquear no site o que já estiver ocupado lá.
 *
 * Observação: o iCal NÃO traz preços — eles ficam em src/config/casa.json.
 */

const UM_DIA = 86_400_000;

export const paraISO = (d: Date) => d.toISOString().slice(0, 10);

/** "20261225" → Date em UTC */
function dataIcal(valor: string): Date | null {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(valor.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

/** Cada evento ocupa as noites de DTSTART até DTEND (exclusivo: o dia da saída fica livre). */
export function noitesOcupadas(ical: string): string[] {
  const noites = new Set<string>();
  const eventos = ical.split("BEGIN:VEVENT").slice(1);

  for (const evento of eventos) {
    const inicio = dataIcal(/DTSTART[^:]*:(.+)/.exec(evento)?.[1] ?? "");
    const fim = dataIcal(/DTEND[^:]*:(.+)/.exec(evento)?.[1] ?? "");
    if (!inicio || !fim) continue;

    for (let t = inicio.getTime(); t < fim.getTime(); t += UM_DIA) {
      noites.add(paraISO(new Date(t)));
    }
  }

  return [...noites].sort();
}

/** Dia de chegada de cada evento (DTSTART), "AAAA-MM-DD". */
export function datasDeChegada(ical: string): string[] {
  const datas = ical
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((evento) => dataIcal(/DTSTART[^:]*:(.+)/.exec(evento)?.[1] ?? ""))
    .filter((d): d is Date => d !== null)
    .map(paraISO);
  return [...new Set(datas)].sort();
}

/**
 * Busca o calendário do Airbnb. Revalida a cada 15 minutos.
 * Se o Airbnb estiver fora do ar, devolve null e o site continua funcionando.
 */
async function buscarIcal(): Promise<string | null> {
  const url = process.env.AIRBNB_ICAL_URL;
  if (!url) return null;

  try {
    const resposta = await fetch(url, { next: { revalidate: 900 } });
    return resposta.ok ? await resposta.text() : null;
  } catch {
    return null;
  }
}

/**
 * Noites ocupadas. Sem o calendário, devolve lista vazia
 * (nesse caso a reserva é só um pedido, você confirma antes de fechar).
 */
export async function buscarNoitesOcupadas(): Promise<string[]> {
  const ical = await buscarIcal();
  return ical ? noitesOcupadas(ical) : [];
}

/**
 * Dias de chegada de hóspedes perto de hoje (de ontem a daqui a uma semana),
 * para o /bem-vindos dar o recado do primeiro dia. Só as datas, sem nomes.
 */
export async function buscarChegadas(): Promise<string[]> {
  const ical = await buscarIcal();
  if (!ical) return [];
  const de = paraISO(new Date(Date.now() - UM_DIA));
  const ate = paraISO(new Date(Date.now() + 7 * UM_DIA));
  return datasDeChegada(ical).filter((d) => d >= de && d <= ate);
}
