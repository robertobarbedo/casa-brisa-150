"use client";

import { useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

type Alerta = { titulo: string; texto: string; abrir: string; voltar: string };
type Props = { href: string; className: string; ariaLabel: string; alerta: Alerta; children: ReactNode };

/** Link externo que, antes de abrir, mostra um aviso de segurança que o hóspede precisa confirmar. */
export function LinkComAlerta({ href, className, ariaLabel, alerta, children }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);

  return (
    <>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          dialogo.current?.showModal();
        }}
      >
        {children}
      </a>

      <dialog
        ref={dialogo}
        aria-labelledby="alerta-titulo"
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-branco p-6 text-taupe backdrop:bg-noite/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogo.current?.close();
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-alerta-suave text-alerta">
            <TriangleAlert aria-hidden className="size-7" />
          </span>
          <h2 id="alerta-titulo" className="text-lg font-bold text-alerta text-balance">
            {alerta.titulo}
          </h2>
          <p className="text-sm text-pretty">{alerta.texto}</p>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => dialogo.current?.close()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-alerta px-4 text-sm font-bold text-branco transition active:scale-95"
          >
            {alerta.abrir}
          </a>
          <button
            type="button"
            autoFocus
            onClick={() => dialogo.current?.close()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-areia px-4 text-sm font-bold text-taupe-escuro transition active:scale-95"
          >
            {alerta.voltar}
          </button>
        </div>
      </dialog>
    </>
  );
}
