/**
 * Regrava public/prices.csv com os preços atuais do PriceLabs.
 *
 * Substitui a exportação manual do painel: a coluna `price` da API é a mesma
 * coisa que a coluna "Final Price" do CSV exportado à mão (conferido dia a dia
 * nas 540 datas da exportação de setembro/2026).
 *
 * Uso: PRICELABS_API_KEY=... node scripts/atualizar-precos.mjs
 * Roda todo dia pelo workflow .github/workflows/precos.yml.
 */
import { writeFile } from "node:fs/promises";

const LISTING_ID = "1702158658942811650";
const PMS = "airbnb";
const DIAS = 540;

/** Abaixo disso, a resposta é curta demais para ser confiável e nada é gravado. */
const MINIMO_DE_DATAS = 300;

const chave = process.env.PRICELABS_API_KEY;
if (!chave) {
  erro("Falta a variável PRICELABS_API_KEY.");
}

const hoje = new Date();
const ate = new Date(hoje);
ate.setDate(ate.getDate() + DIAS);

const resposta = await fetch("https://api.pricelabs.co/v1/listing_prices", {
  method: "POST",
  headers: { "X-API-Key": chave, "Content-Type": "application/json" },
  body: JSON.stringify({
    listings: [
      { id: LISTING_ID, pms: PMS, dateFrom: dia(hoje), dateTo: dia(ate) },
    ],
  }),
});

if (!resposta.ok) {
  erro(`PriceLabs respondeu ${resposta.status}: ${await resposta.text()}`);
}

const [listagem] = await resposta.json();
if (listagem?.error) erro(`PriceLabs recusou a listing: ${listagem.error}`);

const datas = (listagem?.data ?? []).filter(
  (d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number(d.price) > 0,
);

// Sem essa trava, uma resposta degradada apagaria uma tabela de preços boa.
if (datas.length < MINIMO_DE_DATAS) {
  erro(`Só vieram ${datas.length} datas válidas; esperava pelo menos ${MINIMO_DE_DATAS}.`);
}

const linhas = ["Date,Final Price,Min Stay"];
for (const d of datas.sort((a, b) => a.date.localeCompare(b.date))) {
  linhas.push(`${d.date},${Math.round(d.price)},${Number(d.min_stay) > 0 ? d.min_stay : ""}`);
}

await writeFile("public/prices.csv", linhas.join("\n") + "\n", "utf8");

console.log(
  `prices.csv: ${datas.length} datas, de ${datas[0].date} a ${datas.at(-1).date}` +
    ` · moeda ${listagem.currency} · PriceLabs atualizou em ${listagem.last_refreshed_at}`,
);

function dia(data) {
  return data.toISOString().slice(0, 10);
}

function erro(mensagem) {
  console.error(`Preços não atualizados. ${mensagem}`);
  process.exit(1);
}
