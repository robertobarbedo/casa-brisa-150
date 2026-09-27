import { ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { buscarPrevisao } from "@/lib/agora/previsao";
import { categorias, type CategoriaId } from "@/lib/bem-vindos/categorias";
import { Header } from "@/components/header";
import { FaixaAgora } from "@/components/bem-vindos/faixa-agora";
import { visualCategoria } from "@/components/bem-vindos/visual";

type CartaoProps = { id: CategoriaId; lang: Locale; t: Dictionary["bemVindos"]; largo?: boolean };

/** Cartão de categoria. O ícone "voa" até o topo da página da categoria (ViewTransition). */
function Cartao({ id, lang, t, largo = false }: CartaoProps) {
  const { icone: Icone, tom } = visualCategoria[id];
  const c = t.categorias[id];
  return (
    <Link
      href={`/${lang}/bem-vindos/${id}`}
      className={`group flex rounded-3xl bg-branco p-4 shadow-suave ring-1 ring-areia-escura/60 transition active:scale-[0.97] ${
        largo ? "items-center gap-3" : "flex-col"
      }`}
    >
      <ViewTransition name={`categoria-${id}`} share="morph" default="none">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tom}`}>
          <Icone aria-hidden className="size-6" />
        </span>
      </ViewTransition>
      <span className={largo ? "flex-1" : "mt-3"}>
        <span className="block font-bold text-taupe-escuro">{c.titulo}</span>
        <span className="block text-sm leading-snug">{c.sub}</span>
      </span>
      {largo && <ChevronRight aria-hidden className="size-5 text-taupe/60" />}
    </Link>
  );
}

/** Menu do QR code dos cartazes: faixa "Agora" + categorias. */
export default async function BemVindos({ params }: PageProps<"/[lang]/bem-vindos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, previsao] = await Promise.all([getDictionary(lang), buscarPrevisao(casa.mapa)]);
  const t = dict.bemVindos;

  const [emergencia, ...resto] = categorias;
  const ultima = resto.length % 2 === 1 ? resto.pop() : undefined;

  return (
    <>
      <Header lang={lang} dict={dict} caminho="/bem-vindos" inicio="/bem-vindos" />
      <main className="mx-auto max-w-md scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] px-4 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <h1 className="text-2xl font-bold tracking-tight text-taupe-escuro">{t.ola}</h1>
        <p className="mt-1 text-sm">{t.sub}</p>

        <div className="mt-5">
          <FaixaAgora
            lang={lang}
            previsao={previsao}
            local={casa.mapa}
            whatsapp={casa.contato.whatsapp}
            textos={dict.agora}
            mare={{ alta: t.mare.alta, baixa: t.mare.baixa }}
          />
        </div>

        <nav className="mt-6 flex flex-col gap-3">
          <Cartao id={emergencia} lang={lang} t={t} largo />
          <div className="grid grid-cols-2 gap-3">
            {resto.map((id) => (
              <Cartao key={id} id={id} lang={lang} t={t} />
            ))}
          </div>
          {ultima && <Cartao id={ultima} lang={lang} t={t} largo />}
        </nav>

        {casa.contato.whatsapp && (
          <a
            href={`https://wa.me/${casa.contato.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] font-bold text-white shadow-suave transition active:scale-95"
          >
            <MessageCircle aria-hidden className="size-5" />
            {t.whatsapp}
          </a>
        )}
      </main>
    </>
  );
}
