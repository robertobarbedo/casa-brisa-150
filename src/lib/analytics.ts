/**
 * Eventos do GA4 (a tag vem de components/analytics.tsx, só em produção).
 * São estes que o Google Ads importa como conversão:
 * - pedido_reserva: clique em mandar o pedido (WhatsApp ou e-mail) em /reservar.
 * - contato_whatsapp: clique no WhatsApp fora do pedido (botão flutuante, 404).
 * O /bem-vindos não dispara nenhum: quem está lá já é hóspede.
 */
type Parametros = Record<string, string | number>;

declare global {
  interface Window {
    gtag?: (comando: "event", nome: string, parametros?: Parametros) => void;
  }
}

export function evento(nome: "pedido_reserva" | "contato_whatsapp", parametros?: Parametros) {
  if (process.env.NODE_ENV !== "production") console.info("[analytics]", nome, parametros);
  window.gtag?.("event", nome, parametros);
}
