import { ExternalLink, MessageCircle, Phone } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { linkMapa, type Item } from "@/lib/bem-vindos/categorias";
import { BotaoCopiar } from "./botao-copiar";
import { LinkComAlerta } from "./link-com-alerta";
import { iconesItem } from "./visual";

type Props = { itens: Item[]; dict: Dictionary; whatsapp: string };

/** Lista de itens de uma categoria. O cartão inteiro é tocável quando há ação. */
export function ListaItens({ itens, dict, whatsapp }: Props) {
  const t = dict.bemVindos;

  return (
    <ul className="flex flex-col gap-2.5">
      {itens.map((item) => {
        const textos = t.itens[item.id as keyof typeof t.itens];
        const Icone = iconesItem[item.icone];
        const acao = item.acao;
        const alerta =
          acao?.tipo === "mapa" && acao.alerta ? t.alertas[acao.alerta as keyof typeof t.alertas] : undefined;

        const conteudo = (
          <>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-areia text-taupe-escuro">
              {Icone && <Icone aria-hidden className="size-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-taupe-escuro">
                {textos.titulo}
                {item.custo && (
                  <span className="relative -top-px ml-1.5 align-middle text-xs font-normal tracking-wider text-taupe/60">
                    {"$".repeat(item.custo)}
                  </span>
                )}
              </span>
              <span className="block text-sm text-pretty">{textos.texto}</span>
              {alerta && (
                <span className="mt-1 block text-sm font-bold text-alerta">{alerta.aviso}</span>
              )}
            </span>
          </>
        );
        const cartao = "flex items-center gap-3 rounded-3xl bg-branco p-3 ring-1 ring-areia-escura/70";

        if (!acao) return <li key={item.id} className={cartao}>{conteudo}</li>;

        if (acao.tipo === "copiar") {
          return (
            <li key={item.id} className={cartao}>
              {conteudo}
              <BotaoCopiar texto={textos.texto} rotulo={t.copiar} copiado={t.copiado} />
            </li>
          );
        }

        const link =
          acao.tipo === "tel"
            ? { href: `tel:${acao.numero}`, icone: Phone, rotulo: t.ligar, externo: false }
            : acao.tipo === "whatsapp"
              ? { href: `https://wa.me/${whatsapp}`, icone: MessageCircle, rotulo: t.whatsapp, externo: true }
              : { href: linkMapa(acao.busca), icone: ExternalLink, rotulo: t.abrirMapa, externo: true };
        const Acao = link.icone;

        if (alerta) {
          return (
            <li key={item.id}>
              <LinkComAlerta
                href={link.href}
                ariaLabel={`${textos.titulo}: ${link.rotulo}`}
                className={`${cartao} transition active:scale-[0.98]`}
                alerta={alerta}
              >
                {conteudo}
                <Acao aria-hidden className="size-5 shrink-0 text-terracota-forte" />
              </LinkComAlerta>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <a
              href={link.href}
              {...(link.externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={`${textos.titulo}: ${link.rotulo}`}
              className={`${cartao} transition active:scale-[0.98]`}
            >
              {conteudo}
              <Acao aria-hidden className="size-5 shrink-0 text-terracota-forte" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
