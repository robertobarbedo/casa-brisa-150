import "server-only";

import cambio from "@/config/cambio.json";

/**
 * Cotação do dólar (PTAX de venda do Banco Central), para mostrar o preço
 * aproximado em US$. O valor oficial continua sendo em reais.
 *
 * O spread (config/cambio.json) já sai embutido aqui, no servidor: o navegador
 * só recebe a taxa final e o visitante só vê o preço em dólar.
 */

export type Cotacao = {
  /** Quantos reais valem 1 dólar, já com o spread. */
  valor: number;
};

const UM_DIA = 86_400_000;

/** O serviço do BC quer as datas como 'MM-DD-AAAA'. */
const dataBC = (d: Date) => {
  const [a, m, dia] = d.toISOString().slice(0, 10).split("-");
  return `'${m}-${dia}-${a}'`;
};

/** Última PTAX dos últimos 10 dias (cobre fins de semana e feriados). Sem cotação, devolve null e o site fica só em reais. */
export async function buscarCotacaoDolar(): Promise<Cotacao | null> {
  const fim = new Date();
  const inicio = new Date(fim.getTime() - 10 * UM_DIA);
  const url =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
    "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
    `?@dataInicial=${dataBC(inicio)}&@dataFinalCotacao=${dataBC(fim)}` +
    "&$format=json&$select=cotacaoVenda,dataHoraCotacao";

  try {
    const resposta = await fetch(url, { next: { revalidate: 21_600 } });
    if (!resposta.ok) return null;
    const json = (await resposta.json()) as {
      value?: { cotacaoVenda: number; dataHoraCotacao: string }[];
    };
    const ultima = json.value?.at(-1);
    if (!ultima || !(ultima.cotacaoVenda > 0)) return null;
    // Dividir a taxa deixa o preço em dólar spreadPercentual% mais alto.
    return { valor: ultima.cotacaoVenda / (1 + cambio.spreadPercentual / 100) };
  } catch {
    return null;
  }
}
