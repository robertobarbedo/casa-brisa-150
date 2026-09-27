import { intlLocale, type Locale } from "@/i18n/config";

/** Fuso da casa. O Brasil não tem horário de verão desde 2019: UTC−3 fixo. */
export const FUSO = "America/Sao_Paulo";
const OFFSET = -3 * 3_600_000;
export const HORA = 3_600_000;
export const MINUTO = 60_000;

/** Meia-noite (no horário da casa) do dia que contém `t`, em ms. */
export function inicioDoDia(t: number) {
  const local = t + OFFSET;
  return local - (local % 86_400_000) - OFFSET;
}

/** Minutos desde a meia-noite, no horário da casa. */
export const minutoDoDia = (t: number) => Math.floor((t - inicioDoDia(t)) / MINUTO);

/** "16:40" (pt, es) / "4:40 PM" (en), sempre no horário da casa. */
export function formatarHora(t: number, lang: Locale) {
  return new Intl.DateTimeFormat(intlLocale[lang], {
    hour: "numeric",
    minute: "2-digit",
    hour12: lang === "en",
    timeZone: FUSO,
  }).format(t);
}
