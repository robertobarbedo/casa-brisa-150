import "server-only";
import { z } from "zod";
import raw from "@/config/ocupacao.json";
import { dataLocal } from "@/lib/agora/tempo-local";

/**
 * Reservas da casa, preenchidas à mão em src/config/ocupacao.json:
 * só o primeiro nome do hóspede e as datas (AAAA-MM-DD).
 * No dia da `saida`, o /bem-vindos mostra o cartão de check-out.
 *
 * `checkoutSempreVisivel`: liga o cartão todos os dias, para testar.
 */

const data = z.iso.date();

const ocupacaoSchema = z.object({
  checkoutSempreVisivel: z.boolean(),
  reservas: z.array(
    z
      .object({ nome: z.string().trim().min(1), entrada: data, saida: data })
      .refine((r) => r.saida > r.entrada, { message: "saida precisa ser depois da entrada" }),
  ),
});

const ocupacao = ocupacaoSchema.parse(raw);

export const checkoutSempreVisivel = ocupacao.checkoutSempreVisivel;

export type Saida = { nome: string; data: string };

const UM_DIA = 86_400_000;

/**
 * Saídas de ontem a amanhã. A página é estática (o celular decide que dia é),
 * então só essa janela vai para o navegador: nenhum outro nome fica no HTML.
 */
export function saidasProximas(agora = Date.now()): Saida[] {
  const janela = new Set([agora - UM_DIA, agora, agora + UM_DIA].map(dataLocal));
  return ocupacao.reservas.filter((r) => janela.has(r.saida)).map((r) => ({ nome: r.nome, data: r.saida }));
}
