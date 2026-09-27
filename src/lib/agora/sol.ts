/**
 * Nascer e pôr do sol calculados localmente (algoritmo da NOAA, simplificado).
 * Erro de ~1 minuto: suficiente para "o sol se põe às 18h12" e funciona
 * mesmo sem internet ou se a previsão do tempo falhar.
 */

const RAD = Math.PI / 180;

/** @param dia meia-noite UTC do dia desejado (ms) */
export function solDoDia(dia: number, latitude: number, longitude: number) {
  // Dia juliano inteiro desde J2000 (o dia juliano começa ao meio-dia UTC).
  const n = Math.ceil(dia / 86_400_000 + 2440587.5 - 2451545.0 + 0.0008);
  const J = n - longitude / 360; // meio-dia solar médio
  const M = (357.5291 + 0.98560028 * J) % 360; // anomalia média
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360; // longitude eclíptica
  const transito = J + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const declinacao = Math.asin(Math.sin(lambda * RAD) * Math.sin(23.44 * RAD));
  const cosH =
    (Math.sin(-0.833 * RAD) - Math.sin(latitude * RAD) * Math.sin(declinacao)) /
    (Math.cos(latitude * RAD) * Math.cos(declinacao));
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / RAD / 360;
  const paraMs = (jd: number) => (jd + 2451545.0 - 2440587.5) * 86_400_000;
  return { nascer: paraMs(transito - H), porDoSol: paraMs(transito + H) };
}
