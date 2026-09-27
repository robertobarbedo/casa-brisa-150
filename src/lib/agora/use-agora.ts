"use client";

import { useSyncExternalStore } from "react";
import { MINUTO } from "./tempo-local";

/**
 * Hora atual, arredondada ao minuto, que se atualiza sozinha.
 * No servidor (e no primeiro render) é null: a página é estática,
 * então quem decide "que horas são" é sempre o celular do hóspede.
 */
const agoraMinuto = () => Math.floor(Date.now() / MINUTO) * MINUTO;

function assinar(avisar: () => void) {
  const id = setInterval(avisar, 15_000);
  const aoVoltar = () => document.visibilityState === "visible" && avisar();
  document.addEventListener("visibilitychange", aoVoltar);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", aoVoltar);
  };
}

export const useAgora = () => useSyncExternalStore(assinar, agoraMinuto, () => null);
