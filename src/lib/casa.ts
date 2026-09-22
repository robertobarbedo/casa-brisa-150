import "server-only";
import { z } from "zod";
import raw from "@/config/casa.json";

const fotoIds = [
  "principal",
  "fachada",
  "sala",
  "cozinha",
  "suite",
  "quarto2",
  "quarto3",
  "banheiro",
  "jardim",
  "churrasqueira",
  "carregador",
] as const;

export type FotoId = (typeof fotoIds)[number];

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
  fotos: z.array(
    z.object({
      id: z.enum(fotoIds),
      // Caminho em /public/fotos (vazio = placeholder)
      arquivo: z.string(),
    }),
  ),
});

export type Casa = z.infer<typeof casaSchema>;

/** Validado ao importar: um JSON inválido quebra o build, nunca o site no ar. */
export const casa: Casa = casaSchema.parse(raw);
