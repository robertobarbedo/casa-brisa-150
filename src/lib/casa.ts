import "server-only";
import { z } from "zod";
import raw from "@/config/casa.json";

/** Ambientes da casa: cada um tem um rótulo por idioma em i18n/dictionaries. */
const ambientes = [
  "fachada",
  "varanda",
  "sala",
  "cozinha",
  "suite",
  "suiteBanheiro",
  "quartoCasal",
  "quartoSolteiros",
  "banheiro",
  "quintal",
  "carregador",
] as const;

export type Ambiente = (typeof ambientes)[number];

const casaSchema = z.object({
  nome: z.string().min(1),
  capacidade: z.object({
    hospedes: z.number().int().positive(),
    quartos: z.number().int().positive(),
    suites: z.number().int().nonnegative(),
    banheiros: z.number().int().positive(),
  }),
  distanciaPraiaMetros: z.number().int().positive(),
  petFriendly: z.boolean(),
  carregadorEletrico: z.boolean(),
  precos: z.object({
    diaria: z.number().positive(),
    limpeza: z.number().nonnegative(),
    minimoNoites: z.number().int().positive(),
    descontoPercentual: z.number().min(0).max(100),
  }),
  contato: z.object({
    // Somente dígitos com DDI, ex.: 5548999999999 (vazio = botão escondido)
    whatsapp: z.string().regex(/^(\d{12,13})?$/),
    // O primeiro recebe o pedido, os demais entram em cópia
    emails: z.array(z.email()),
  }),
  mapa: z.object({
    latitude: z.number(),
    longitude: z.number(),
    zoom: z.number().int(),
  }),
  // Todas as fotos da casa, na ordem em que aparecem na galeria.
  // A primeira também é a foto de capa do topo da página.
  fotos: z
    .array(
      z.object({
        // Caminho em /public, ex.: "/fotos/frente-1.jpg"
        arquivo: z.string().min(1),
        ambiente: z.enum(ambientes),
      }),
    )
    .min(1),
});

export type Casa = z.infer<typeof casaSchema>;

/** Validado ao importar: um JSON inválido quebra o build, nunca o site no ar. */
export const casa: Casa = casaSchema.parse(raw);
