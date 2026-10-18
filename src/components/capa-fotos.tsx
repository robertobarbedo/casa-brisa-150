"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { evento } from "@/lib/analytics";
import { fill } from "@/lib/format";
import { Foto } from "./foto";

type FotoCapa = { arquivo: string; label: string };

type Textos = {
  regiao: string;
  verTodas: string;
  maisFotos: string;
  ampliar: string;
  fechar: string;
  anterior: string;
  proxima: string;
};

type Props = {
  /** Todas as fotos da casa, na ordem do visualizador. */
  fotos: FotoCapa[];
  /**
   * Índices (em `fotos`) das fotos da capa: as 3 primeiras deslizam no celular e a 4ª vira o
   * "ver mais"; no desktop as 5 formam o mosaico (uma grande e quatro pequenas).
   */
  destaques: number[];
  textos: Textos;
};

/** Índice do item visível num carrossel horizontal de itens com a largura do contêiner. */
const indiceVisivel = (el: HTMLElement) => Math.round(el.scrollLeft / el.clientWidth);

export function CapaFotos({ fotos, destaques, textos }: Props) {
  const [atual, setAtual] = useState(0);
  const [aberta, setAberta] = useState<number | null>(null);
  const noCelular = destaques.slice(0, 3);

  // Fotos diferentes vistas desde que o visualizador abriu (null = fechado).
  const vistas = useRef<Set<number> | null>(null);
  const deslizou = useRef(false);

  const encerrar = useCallback(() => {
    if (vistas.current) {
      evento("fotos_fechadas", { fotos_vistas: vistas.current.size, total: fotos.length });
      vistas.current = null;
    }
    setAberta(null);
  }, [fotos.length]);

  // O visualizador ganha uma entrada no histórico: o "voltar" do celular fecha as fotos
  // em vez de sair do site.
  useEffect(() => {
    window.addEventListener("popstate", encerrar);
    return () => window.removeEventListener("popstate", encerrar);
  }, [encerrar]);

  const abrir = (i: number, origem: "capa_foto" | "capa_ver_mais" | "mosaico_ver_todas") => {
    evento("fotos_abertas", { origem, foto: fotos[i].arquivo });
    vistas.current = new Set([i]);
    history.pushState({ ...history.state, fotos: true }, "");
    setAberta(i);
  };
  const fechar = () => (history.state?.fotos ? history.back() : encerrar());

  return (
    <div role="region" aria-label={textos.regiao} className="relative md:px-4 md:pt-6">
      <ul
        onScroll={(e) => {
          const i = indiceVisivel(e.currentTarget);
          setAtual(i);
          if (i > 0 && !deslizou.current) {
            deslizou.current = true;
            evento("capa_deslizada");
          }
        }}
        className="sem-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-b-[var(--radius-brisa)] md:grid md:h-[min(62vh,30rem)] md:grid-cols-4 md:grid-rows-2 md:gap-2 md:overflow-hidden md:canto-brisa md:rounded-br-[4rem]"
      >
        {destaques.map((i, posicao) => {
          const foto = fotos[i];
          const verMais = posicao === 3;
          return (
            <li
              key={foto.arquivo}
              className={`relative aspect-[5/4] w-full shrink-0 snap-start md:aspect-auto md:w-auto ${
                posicao === 0 ? "md:col-span-2 md:row-span-2" : ""
              } ${posicao > 3 ? "hidden md:block" : ""}`}
            >
              <Foto
                label={foto.label}
                arquivo={foto.arquivo}
                priority={posicao === 0}
                sizes={posicao === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                className="size-full"
              />
              <button
                type="button"
                onClick={() => abrir(i, "capa_foto")}
                aria-label={fill(textos.ampliar, { foto: foto.label })}
                className="absolute inset-0 transition-colors md:hover:bg-black/10"
              />
              {/* No celular, a 4ª foto fica escurecida e chama para o visualizador. */}
              {verMais && (
                <button
                  type="button"
                  onClick={() => abrir(0, "capa_ver_mais")}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-taupe-escuro/60 font-bold text-white md:hidden"
                >
                  <Images aria-hidden className="size-8" strokeWidth={1.5} />
                  <span className="text-2xl">{fill(textos.maisFotos, { n: fotos.length - noCelular.length })}</span>
                  <span className="rounded-full bg-branco px-4 py-2 text-sm text-taupe-escuro">{textos.verTodas}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {atual < noCelular.length && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 bottom-4 rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white tabular-nums md:hidden"
        >
          {atual + 1} / {noCelular.length}
        </span>
      )}

      <button
        type="button"
        onClick={() => abrir(0, "mosaico_ver_todas")}
        className="absolute right-8 bottom-4 hidden items-center gap-2 rounded-full bg-branco px-4 py-2 text-sm font-bold text-taupe-escuro shadow-suave transition active:scale-95 md:inline-flex"
      >
        <Images aria-hidden className="size-4" />
        {textos.verTodas} ({fotos.length})
      </button>

      {aberta !== null && (
        <Visualizador
          fotos={fotos}
          inicial={aberta}
          textos={textos}
          onVer={(i) => vistas.current?.add(i)}
          onFechar={fechar}
        />
      )}
    </div>
  );
}

type VisualizadorProps = {
  fotos: FotoCapa[];
  inicial: number;
  textos: Textos;
  onVer: (i: number) => void;
  onFechar: () => void;
};

/** Fotos em tela cheia: desliza no celular, setas e teclado no desktop; X, Esc ou voltar fecha. */
function Visualizador({ fotos, inicial, textos, onVer, onFechar }: VisualizadorProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const trilho = useRef<HTMLUListElement>(null);
  const [atual, setAtual] = useState(inicial);

  useEffect(() => {
    const d = dialogo.current;
    const t = trilho.current;
    if (!d || !t) return;
    if (!d.open) d.showModal();
    t.scrollLeft = inicial * t.clientWidth;
    // Só na abertura: `inicial` não muda enquanto o visualizador está aberto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const irPara = (i: number) => {
    const t = trilho.current;
    if (!t) return;
    const destino = Math.max(0, Math.min(fotos.length - 1, i));
    t.scrollTo({ left: destino * t.clientWidth, behavior: "smooth" });
  };

  const seta =
    "absolute top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25 disabled:opacity-0 md:grid";

  return (
    <dialog
      ref={dialogo}
      aria-label={textos.regiao}
      onClose={onFechar}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") irPara(atual + 1);
        if (e.key === "ArrowLeft") irPara(atual - 1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-black p-0 text-white backdrop:bg-black"
    >
      <ul
        ref={trilho}
        onScroll={(e) => {
          const i = indiceVisivel(e.currentTarget);
          setAtual(i);
          onVer(i);
        }}
        className="sem-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
      >
        {fotos.map((f, i) => (
          <li key={f.arquivo} className="relative h-full w-full shrink-0 snap-center snap-always">
            {/* Só carrega a foto da vez e as vizinhas. */}
            {Math.abs(i - atual) <= 1 && (
              <Image src={f.arquivo} alt={f.label} fill sizes="100vw" className="object-contain" />
            )}
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 bg-gradient-to-b from-black/60 to-transparent px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-6">
        <p className="text-sm font-semibold" aria-live="polite">
          <span className="tabular-nums">
            {atual + 1} / {fotos.length}
          </span>
          <span className="ml-3 text-white/80">{fotos[atual]?.label}</span>
        </p>
        <button
          type="button"
          onClick={() => dialogo.current?.close()}
          aria-label={textos.fechar}
          autoFocus
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15 transition hover:bg-white/25 active:scale-95"
        >
          <X aria-hidden className="size-6" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => irPara(atual - 1)}
        disabled={atual === 0}
        aria-label={textos.anterior}
        className={`${seta} left-4`}
      >
        <ChevronLeft aria-hidden className="size-7" />
      </button>
      <button
        type="button"
        onClick={() => irPara(atual + 1)}
        disabled={atual === fotos.length - 1}
        aria-label={textos.proxima}
        className={`${seta} right-4`}
      >
        <ChevronRight aria-hidden className="size-7" />
      </button>
    </dialog>
  );
}
