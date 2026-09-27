import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Phone } from "lucide-react";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { buscarPrevisao } from "@/lib/agora/previsao";
import { categorias, ehCategoria, itensDe, numerosEmergencia } from "@/lib/bem-vindos/categorias";
import { ListaItens } from "@/components/bem-vindos/lista-itens";
import { PainelMare } from "@/components/bem-vindos/painel-mare";
import { PainelTempo } from "@/components/bem-vindos/painel-tempo";
import { visualCategoria } from "@/components/bem-vindos/visual";

export function generateStaticParams() {
  return categorias.map((categoria) => ({ categoria }));
}

export default async function Categoria({ params }: PageProps<"/[lang]/bem-vindos/[categoria]">) {
  const { lang, categoria } = await params;
  if (!hasLocale(lang) || !ehCategoria(categoria)) notFound();

  const [dict, previsao] = await Promise.all([
    getDictionary(lang),
    categoria === "praia" || categoria === "tempo" ? buscarPrevisao(casa.mapa) : null,
  ]);
  const t = dict.bemVindos;
  const { icone: Icone, tom } = visualCategoria[categoria];
  const outras = categorias.filter((c) => c !== categoria);

  return (
    <>
      <main className="mx-auto max-w-md px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <ViewTransition name={`categoria-${categoria}`} share="morph" default="none">
            <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${tom}`}>
              <Icone aria-hidden className="size-7" />
            </span>
          </ViewTransition>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-taupe-escuro">{t.categorias[categoria].titulo}</h1>
            <p className="text-sm">{t.categorias[categoria].sub}</p>
          </div>
        </div>

        <div className="entrar mt-6 flex flex-col gap-4">
          {categoria === "emergencia" && (
            <div className="grid grid-cols-3 gap-2">
              {numerosEmergencia.map((n) => (
                <a
                  key={n.id}
                  href={`tel:${n.tel}`}
                  className="flex flex-col items-center rounded-3xl bg-alerta px-2 py-3 text-center text-branco shadow-suave transition active:scale-95"
                >
                  <Phone aria-hidden className="size-4 opacity-80" />
                  <span className="text-2xl font-bold">{n.tel}</span>
                  <span className="text-[11px] leading-tight font-bold opacity-90">
                    {t.numeros[n.id as keyof typeof t.numeros]}
                  </span>
                </a>
              ))}
            </div>
          )}

          {categoria === "tempo" && previsao && (
            <PainelTempo lang={lang} tempo={previsao.tempo} textos={t.tempo} ceu={dict.agora.ceu} />
          )}

          {categoria === "praia" && previsao && (
            <PainelMare lang={lang} mare={previsao.mare} local={casa.mapa} textos={t.mare} />
          )}

          <ListaItens itens={itensDe(categoria)} dict={dict} whatsapp={casa.contato.whatsapp} />

          <section className="mt-4">
            <h2 className="text-sm font-bold text-taupe-escuro">{t.vejaTambem}</h2>
            <ul className="sem-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
              {outras.map((id) => {
                const { icone: I, tom: tomOutra } = visualCategoria[id];
                return (
                  <li key={id} className="shrink-0">
                    <Link
                      href={`/${lang}/bem-vindos/${id}`}
                      className="flex items-center gap-2 rounded-full bg-branco py-1.5 pr-4 pl-1.5 text-sm font-bold text-taupe-escuro ring-1 ring-areia-escura/70 transition active:scale-95"
                    >
                      <span className={`grid size-8 place-items-center rounded-full ${tomOutra}`}>
                        <I aria-hidden className="size-4" />
                      </span>
                      {t.categorias[id].titulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>

      {/* Voltar ao menu, na altura do polegar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Link
          href={`/${lang}/bem-vindos`}
          className="pointer-events-auto flex h-12 items-center gap-1.5 rounded-full bg-taupe-escuro pr-5 pl-3.5 font-bold text-branco shadow-suave transition active:scale-95"
        >
          <ChevronLeft aria-hidden className="size-5" />
          {t.menu}
        </Link>
      </div>
    </>
  );
}
