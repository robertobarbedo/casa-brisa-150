import dados from "@/config/bem-vindos.json";

/** Ordem do menu do /bem-vindos. Emergência sempre primeiro. */
export const categorias = ["emergencia", "tempo", "praia", "passeios", "comer", "perto", "casa"] as const;
export type CategoriaId = (typeof categorias)[number];

export const ehCategoria = (valor: string): valor is CategoriaId =>
  (categorias as readonly string[]).includes(valor);

export type Acao =
  | { tipo: "tel"; numero: string }
  | { tipo: "mapa"; busca: string }
  | { tipo: "whatsapp" }
  | { tipo: "copiar" };

export type Item = { id: string; icone: string; acao?: Acao };

export const itensDe = (categoria: CategoriaId) => dados.itens[categoria] as Item[];
export const numerosEmergencia = dados.numeros;

export const linkMapa = (busca: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(busca)}`;
