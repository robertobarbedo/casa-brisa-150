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

/** Hora ISO 8601 com fuso, ex.: "15:00:00-03:00" (z.iso.time não aceita offset). */
const horaComFuso = z.string().regex(/^\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);

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
  // Configuração de camas, para o dado estruturado (schema.org BedDetails).
  camas: z
    .array(
      z.object({
        tipo: z.enum(["Double", "Single", "Sofa Bed"]),
        quantidade: z.number().int().positive(),
      }),
    )
    .min(1),
  // Horários em ISO 8601 com fuso; o texto exibido vive nos dicionários.
  regras: z.object({
    checkIn: horaComFuso,
    checkOut: horaComFuso,
  }),
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
  // Sem rua: o endereço exato só vai para o hóspede depois da reserva confirmada.
  endereco: z.object({
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    // Sigla do estado (SC) e do país (BR), como o schema.org espera.
    estado: z.string().length(2),
    pais: z.string().length(2),
  }),
  // Perfis da casa em outros serviços; vazio = fica de fora do dado estruturado.
  links: z.object({
    googleMaps: z.union([z.url(), z.literal("")]),
    airbnb: z.union([z.url(), z.literal("")]),
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
