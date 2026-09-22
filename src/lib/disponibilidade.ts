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

/**
 * Busca o calendário do Airbnb. Revalida a cada 15 minutos.
 * Se o Airbnb estiver fora do ar, devolve lista vazia e o site continua funcionando
 * (nesse caso a reserva é só um pedido, você confirma antes de fechar).
 */
export async function buscarNoitesOcupadas(): Promise<string[]> {
  const url = process.env.AIRBNB_ICAL_URL;
  if (!url) return [];

  try {
    const resposta = await fetch(url, { next: { revalidate: 900 } });
    if (!resposta.ok) return [];
    return noitesOcupadas(await resposta.text());
  } catch {
    return [];
  }
}
