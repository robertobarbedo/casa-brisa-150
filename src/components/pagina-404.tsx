"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarDays, House, MessageCircle } from "lucide-react";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { Header } from "./header";
import { Logo } from "./logo";

export type Textos404 = Dictionary["naoEncontrada"] & Pick<Dictionary, "nav"> & { mensagemWhatsapp: string };

type Props = { textos: Record<Locale, Textos404>; whatsapp: string };

/** 404 amigável; o idioma vem da URL (/pt/..., /es/..., /en/...). */
export function Pagina404({ textos, whatsapp }: Props) {
  const { lang: param } = useParams<{ lang?: string }>();
  const lang = param && hasLocale(param) ? param : defaultLocale;
  const t = textos[lang];

  return (
    <>
      <title>{t.meta}</title>
      <Header lang={lang} dict={t} />
      <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <div className="relative mb-8">
          <div aria-hidden className="absolute inset-0 -z-10 scale-150 rounded-full bg-azul-suave blur-2xl" />
          <Logo className="size-28 drop-shadow-sm" />
        </div>

        <span className="rounded-full bg-terracota-suave px-3 py-1 text-xs font-bold tracking-wide text-terracota-forte uppercase">
          {t.selo}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-balance text-taupe-escuro">{t.titulo}</h1>
        <p className="mt-3 text-pretty">{t.texto}</p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href={`/${lang}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-terracota-forte px-6 font-bold text-branco shadow-suave transition active:scale-95"
          >
            <House aria-hidden className="size-5" />
            {t.inicio}
          </Link>
          <Link
            href={`/${lang}/reservar`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-areia px-6 font-bold text-taupe-escuro transition active:scale-95"
          >
            <CalendarDays aria-hidden className="size-5" />
            {t.reservar}
          </Link>
        </div>

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(t.mensagemWhatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-folha-forte underline-offset-4 hover:underline"
          >
            <MessageCircle aria-hidden className="size-4" />
            {t.whatsapp}
          </a>
        )}
      </main>
    </>
  );
}
