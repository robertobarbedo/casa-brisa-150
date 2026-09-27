import { notFound } from "next/navigation";

/** Qualquer caminho desconhecido dentro de /[lang] cai na 404 traduzida. */
export default function Resto() {
  notFound();
}
