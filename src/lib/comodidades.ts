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
  // As 8 primeiras ficam sempre à vista (COMODIDADES_VISIVEIS); o resto abre no "ver todas".
  { key: "praia", ativo: () => true, schemaName: "Beach access" },
  { key: "arCondicionado", ativo: () => true, schemaName: "Air conditioning" },
  { key: "wifi", ativo: () => true, schemaName: "Wi-Fi" },
  { key: "roupaCama", ativo: () => true, schemaName: "Bed linens and towels" },
  { key: "cozinha", ativo: () => true, schemaName: "Kitchen" },
  { key: "churrasqueira", ativo: () => true, schemaName: "Barbecue grill" },
  { key: "pet", ativo: (c: Casa) => c.petFriendly, schemaName: "Pet friendly" },
  { key: "estacionamento", ativo: () => true, schemaName: "Free parking" },
  { key: "eletrico", ativo: (c: Casa) => c.carregadorEletrico, schemaName: "EV charger" },
  { key: "cadeirasPraia", ativo: () => true, schemaName: "Beach chairs and umbrellas" },
  { key: "jardim", ativo: () => true, schemaName: "Garden" },
  { key: "rede", ativo: () => true, schemaName: "Hammock" },
  { key: "tv", ativo: () => true, schemaName: "TV with streaming" },
  { key: "trabalho", ativo: () => true, schemaName: "Dedicated workspace" },
  { key: "cafeteira", ativo: () => true, schemaName: "Coffee maker" },
  { key: "fogaoInducao", ativo: () => true, schemaName: "Induction stove" },
  { key: "forno", ativo: () => true, schemaName: "Oven" },
  { key: "microondas", ativo: () => true, schemaName: "Microwave" },
  { key: "geladeira", ativo: () => true, schemaName: "Refrigerator" },
  { key: "freezer", ativo: () => true, schemaName: "Freezer" },
  { key: "temperos", ativo: () => true, schemaName: "Cooking basics" },
  { key: "lavaRoupa", ativo: () => true, schemaName: "Washing machine" },
  { key: "secador", ativo: () => true, schemaName: "Hair dryer" },
  { key: "ferro", ativo: () => true, schemaName: "Iron" },
  { key: "detectores", ativo: () => true, schemaName: "Smoke and carbon monoxide detectors" },
] as const satisfies readonly {
  key: string;
  ativo: (casa: Casa) => boolean;
  schemaName: string;
}[];

/** Quantas comodidades aparecem antes do "ver todas". */
export const COMODIDADES_VISIVEIS = 8;

export type ComodidadeKey = (typeof comodidades)[number]["key"];

export const comodidadesAtivas = (casa: Casa) => comodidades.filter((c) => c.ativo(casa));
