"use client";

import Link from "next/link";
import { Globe, KeyRound, LogOut, MessageCircle, Tv, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { dataLocal, minutoDoDia } from "@/lib/agora/tempo-local";
import { useAgora } from "@/lib/agora/use-agora";
import { fill } from "@/lib/format";

/** No dia da saída, o cartão some às 13h (o check-out é às 11h). */
const VISIVEL_ATE = 13 * 60;

type Textos = {
  titulo: string;
  tituloNome: string;
  hora: string;
  itens: { tv: string; louca: string; chave: string };
  contato: string;
};

type Saida = { nome: string; data: string };

type CheckoutProps = {
  saidas: Saida[];
  sempreVisivel: boolean;
  horario: string;
  whatsapp: string;
  botao: string;
  textos: Textos;
};

type TopoProps = CheckoutProps & {
  titulo: string;
  tituloCheckout: string;
  idioma: string;
};

const itens: { id: keyof Textos["itens"]; icone: LucideIcon }[] = [
  { id: "tv", icone: Tv },
  { id: "louca", icone: UtensilsCrossed },
  { id: "chave", icone: KeyRound },
];

/**
 * O check-out de hoje, ou null. Quem decide "que dia e que horas são" é o celular do hóspede.
 * `sempreVisivel` (testes) mostra o cartão a qualquer hora; o nome só aparece se houver saída hoje.
 */
function useCheckout(saidas: Saida[], sempreVisivel: boolean) {
  const agora = useAgora();
  if (!agora) return null;
  const saida = saidas.find((s) => s.data === dataLocal(agora));
  if (sempreVisivel) return { nome: saida?.nome };
  if (!saida || minutoDoDia(agora) >= VISIVEL_ATE) return null;
  return { nome: saida.nome };
}

/** Topo do /bem-vindos: título, globo (volta à escolha de idioma) e, no dia da saída, o cartão de check-out. */
export function TopoBemVindos({ titulo, tituloCheckout, idioma, ...checkout }: TopoProps) {
  const hoje = useCheckout(checkout.saidas, checkout.sempreVisivel);

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-balance text-taupe-escuro">
          {hoje ? tituloCheckout : titulo}
        </h1>
        <Link
          href="/bem-vindos?idioma"
          aria-label={idioma}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-areia text-taupe-escuro transition active:scale-95"
        >
          <Globe aria-hidden className="size-4" />
        </Link>
      </div>

      {hoje && <CartaoCheckout nome={hoje.nome} {...checkout} />}
    </>
  );
}

function CartaoCheckout({ nome, horario, whatsapp, botao, textos }: CheckoutProps & { nome?: string }) {
  return (
    <section className="mt-5 rounded-3xl bg-branco p-5 shadow-suave ring-1 ring-areia-escura/60">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-terracota-suave text-taupe-escuro">
          <LogOut aria-hidden className="size-6" />
        </span>
        <div>
          <h2 className="font-bold text-taupe-escuro">
            {nome ? fill(textos.tituloNome, { nome }) : textos.titulo}
          </h2>
          <p className="text-sm">{fill(textos.hora, { hora: horario })}</p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-3">
        {itens.map(({ id, icone: Icone }) => (
          <li key={id} className="flex items-start gap-3 text-sm text-pretty">
            <Icone aria-hidden className="mt-0.5 size-5 shrink-0 text-taupe" />
            {textos.itens[id]}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-pretty">{textos.contato}</p>

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full bg-folha/15 text-sm font-bold text-folha-forte transition active:scale-95"
        >
          <MessageCircle aria-hidden className="size-5" />
          {botao}
        </a>
      )}
    </section>
  );
}
