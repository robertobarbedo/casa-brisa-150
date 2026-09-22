import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { casa } from "@/lib/casa";
import { carregarTabelaPrecos } from "@/lib/tabela-precos";
import { menorDiaria } from "@/lib/precos";
import { Header } from "@/components/header";
import { BookingBar } from "@/components/booking-bar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Comodidades, Faq, Galeria, Hero, Regiao, Regras, Rodape, Sobre } from "@/components/sections";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, tabela] = await Promise.all([getDictionary(lang), carregarTabelaPrecos()]);

  return (
    <>
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
      <BookingBar lang={lang} dict={dict} diaria={menorDiaria(casa, tabela)} minimoNoites={casa.precos.minimoNoites} />
    </>
  );
}
