import type { Casa } from "./casa";

/**
 * As comodidades da casa, na ordem em que aparecem na seção "O que a casa oferece".
 *
 * `key` casa com dict.comodidades.itens (texto exibido) e com o mapa de ícones
 * em sections.tsx. `schemaName` é o nome canônico em inglês usado no dado
 * estruturado: ele não pode sair do dicionário, senão o nó da casa ficaria
 * diferente em cada idioma.
 */
export const comodidades = [
  { key: "praia", ativo: () => true, schemaName: "Beach access" },
  { key: "eletrico", ativo: (c: Casa) => c.carregadorEletrico, schemaName: "EV charger" },
  { key: "pet", ativo: (c: Casa) => c.petFriendly, schemaName: "Pet friendly" },
  { key: "wifi", ativo: () => true, schemaName: "Wi-Fi" },
  { key: "cozinha", ativo: () => true, schemaName: "Kitchen" },
  { key: "churrasqueira", ativo: () => true, schemaName: "Barbecue grill" },
  { key: "jardim", ativo: () => true, schemaName: "Garden" },
  { key: "estacionamento", ativo: () => true, schemaName: "Free parking" },
] as const satisfies readonly {
  key: string;
  ativo: (casa: Casa) => boolean;
  schemaName: string;
}[];

export type ComodidadeKey = (typeof comodidades)[number]["key"];

export const comodidadesAtivas = (casa: Casa) => comodidades.filter((c) => c.ativo(casa));
