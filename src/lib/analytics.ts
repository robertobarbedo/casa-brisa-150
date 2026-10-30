/**
 * Eventos do GA4 (a tag vem de components/analytics.tsx, só em produção).
 * São estes que o Google Ads importa como conversão:
 * - pedido_reserva: clique em mandar o pedido pelo WhatsApp em /reservar.
 * - contato_whatsapp: clique no WhatsApp fora do pedido (botão flutuante, 404).
 * Os demais medem engajamento com as fotos e as comodidades (não são conversão):
 * - fotos_abertas: abriu o visualizador (origem: capa_foto, capa_ver_mais ou mosaico_ver_todas).
 * - fotos_fechadas: fechou o visualizador, com quantas fotos diferentes viu.
 * - capa_deslizada: deslizou a capa no celular (uma vez por página).
 * - comodidades_expandidas: abriu o "ver todas" das comodidades.
 * O /bem-vindos não dispara nenhum: quem está lá já é hóspede.
 */
type Parametros = Record<string, string | number>;

declare global {
  interface Window {
    gtag?: (comando: "event", nome: string, parametros?: Parametros) => void;
  }
}

export type NomeEvento =
  | "pedido_reserva"
  | "contato_whatsapp"
  | "fotos_abertas"
  | "fotos_fechadas"
  | "capa_deslizada"
  | "comodidades_expandidas";

export function evento(nome: NomeEvento, parametros?: Parametros) {
  if (process.env.NODE_ENV !== "production") console.info("[analytics]", nome, parametros);
  window.gtag?.("event", nome, parametros);
}
