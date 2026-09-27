import type { Locale } from "@/i18n/config";

/** Guarda o idioma: da próxima vez, o QR code (/bem-vindos) já abre nele (ver proxy.ts). */
export function lembrarIdioma(l: Locale) {
  document.cookie = `locale=${l}; path=/; max-age=31536000; samesite=lax`;
}
