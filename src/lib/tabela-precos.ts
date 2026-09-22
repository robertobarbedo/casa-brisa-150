import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { casa } from "@/lib/casa";
import type { TabelaPrecos } from "@/lib/precos";

/**
 * Lê public/prices.csv, exportado do PriceLabs.
 * Colunas usadas: Date, Final Price, Min Stay.
 * Basta substituir o arquivo por uma exportação nova e publicar.
 */
export async function carregarTabelaPrecos(): Promise<TabelaPrecos> {
  const arquivo = path.join(process.cwd(), "public", "prices.csv");

  let csv: string;
  try {
    csv = await readFile(arquivo, "utf8");
  } catch {
    return {}; // sem CSV, o site usa a diária base de casa.json
  }

  const linhas = csv.trim().split(/\r?\n/);
  const cabecalho = separar(linhas[0]);
  const iData = cabecalho.indexOf("Date");
  const iPreco = cabecalho.indexOf("Final Price");
  const iMinimo = cabecalho.indexOf("Min Stay");
  if (iData < 0 || iPreco < 0) return {};

  const tabela: TabelaPrecos = {};

  for (const linha of linhas.slice(1)) {
    const colunas = separar(linha);
    const data = colunas[iData];
    const preco = Number(colunas[iPreco]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !Number.isFinite(preco) || preco <= 0) continue;

    const minimo = Number(colunas[iMinimo]);
    tabela[data] = {
      preco,
      minimo: Number.isFinite(minimo) && minimo > 0 ? minimo : casa.precos.minimoNoites,
    };
  }

  return tabela;
}

/** Só as datas de hoje em diante, para não mandar o passado ao navegador. */
export function recortarFuturo(tabela: TabelaPrecos, meses = 12): TabelaPrecos {
  const hoje = new Date().toISOString().slice(0, 10);
  const limite = new Date();
  limite.setMonth(limite.getMonth() + meses);
  const fim = limite.toISOString().slice(0, 10);

  return Object.fromEntries(
    Object.entries(tabela).filter(([data]) => data >= hoje && data <= fim),
  );
}

/** Divide uma linha de CSV respeitando as aspas. */
function separar(linha: string): string[] {
  return linha
    .split(",")
    .map((c) => c.trim().replace(/^"|"$/g, ""));
}
