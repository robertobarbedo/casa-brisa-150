import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { carregarTabelaPrecos } from "@/lib/tabela-precos";
import { faixaDiarias, menorDiaria } from "@/lib/precos";
import { grafoHome } from "@/lib/schema";
import { Header } from "@/components/header";
import { BookingBar } from "@/components/booking-bar";
import { JsonLd } from "@/components/json-ld";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Comodidades, Faq, Galeria, Hero, Regiao, Regras, Rodape, Sobre } from "@/components/sections";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tabela] = await Promise.all([getDictionary(lang), carregarTabelaPrecos()]);

  const diaria = menorDiaria(casa, tabela);

  return (
    <>
      <JsonLd data={grafoHome(lang, dict, casa, diaria, faixaDiarias(casa, tabela))} />
      <Header lang={lang} dict={dict} />
      <main>
        <Hero dict={dict} casa={casa} />
        <Galeria dict={dict} casa={casa} />
        <Sobre dict={dict} casa={casa} />
        <Comodidades dict={dict} casa={casa} />
        <Regiao dict={dict} casa={casa} />
        <Regras dict={dict} />
        <Faq dict={dict} />
      </main>
      <Rodape dict={dict} casa={casa} />
      <WhatsAppButton numero={casa.contato.whatsapp} mensagem={dict.whatsapp.mensagem} aria={dict.whatsapp.aria} />
      <BookingBar lang={lang} dict={dict} diaria={diaria} minimoNoites={casa.precos.minimoNoites} />
    </>
  );
}
