import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { fill, formatBRL } from "@/lib/format";

type Props = {
  lang: Locale;
  dict: Dictionary;
  diaria: number;
  minimoNoites: number;
};

/** Barra fixa no rodapé: preço sempre visível e o botão principal ao alcance do polegar. */
export function BookingBar({ lang, dict, diaria, minimoNoites }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-areia-escura bg-branco/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:bottom-4 md:mx-auto md:max-w-xl md:rounded-full md:border md:shadow-suave">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="leading-tight">
          <p className="text-xs text-taupe/80">{dict.reserva.aPartirDe}</p>
          <p className="text-taupe-escuro">
            <span className="text-lg font-extrabold">{formatBRL(diaria, lang)}</span>
            <span className="text-sm"> / {dict.reserva.porNoite}</span>
          </p>
          <p className="text-xs text-taupe/80">{fill(dict.reserva.minimo, { n: minimoNoites })}</p>
        </div>
        <Link
          href={`/${lang}/reservar`}
          className="grid h-12 place-items-center rounded-full bg-terracota-forte px-6 text-base font-bold text-branco shadow-suave transition active:scale-95"
        >
          {dict.reserva.escolherDatas}
        </Link>
      </div>
    </div>
  );
}
