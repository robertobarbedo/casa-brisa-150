"use client";

import { KeyRound, LogOut, MessageCircle, Tv, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { dataLocal } from "@/lib/agora/tempo-local";
import { useAgora } from "@/lib/agora/use-agora";
import { fill } from "@/lib/format";

type Textos = {
  titulo: string;
  tituloNome: string;
  hora: string;
  itens: { tv: string; louca: string; chave: string };
  obrigado: string;
};

type Props = {
  saidas: { nome: string; data: string }[];
  sempreVisivel: boolean;
  horario: string;
  whatsapp: string;
  botao: string;
  textos: Textos;
};

const itens: { id: keyof Textos["itens"]; icone: LucideIcon }[] = [
  { id: "tv", icone: Tv },
  { id: "louca", icone: UtensilsCrossed },
  { id: "chave", icone: KeyRound },
];

/** Cartão do dia da saída. Quem decide "que dia é hoje" é o celular do hóspede. */
export function CartaoCheckout({ saidas, sempreVisivel, horario, whatsapp, botao, textos }: Props) {
  const agora = useAgora();
  if (!agora) return null;

  const hoje = dataLocal(agora);
  const saida = saidas.find((s) => s.data === hoje);
  if (!saida && !sempreVisivel) return null;

  return (
    <section className="mt-6 rounded-3xl bg-branco p-5 shadow-suave ring-1 ring-areia-escura/60">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-terracota-suave text-taupe-escuro">
          <LogOut aria-hidden className="size-6" />
        </span>
        <div>
          <h2 className="font-bold text-taupe-escuro">
            {saida ? fill(textos.tituloNome, { nome: saida.nome }) : textos.titulo}
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

      <p className="mt-4 text-sm text-pretty">{textos.obrigado}</p>

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
