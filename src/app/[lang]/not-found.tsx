import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { Pagina404, type Textos404 } from "@/components/pagina-404";

/**
 * not-found.tsx não recebe params, e ler headers() aqui tiraria todas as
 * páginas de [lang] do SSG. Então manda os textos dos 3 idiomas (são poucos)
 * e o componente escolhe pela URL no cliente.
 */
export default async function NaoEncontrada() {
  const textos = Object.fromEntries(
    await Promise.all(
      locales.map(async (l) => {
        const dict = await getDictionary(l);
        const t: Textos404 = { ...dict.naoEncontrada, nav: dict.nav, mensagemWhatsapp: dict.whatsapp.mensagem };
        return [l, t] as const;
      }),
    ),
  ) as Record<(typeof locales)[number], Textos404>;

  return <Pagina404 textos={textos} whatsapp={casa.contato.whatsapp} />;
}
