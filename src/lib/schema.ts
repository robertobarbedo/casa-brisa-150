import "server-only";
import { intlLocale, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import pt from "@/i18n/dictionaries/pt.json";
import { siteUrl } from "@/config/site";
import type { Casa } from "./casa";
import { comodidadesAtivas } from "./comodidades";

// Identificadores estáveis do grafo. Os dois primeiros descrevem a casa e não
// mudam com o idioma; o que é traduzido mora nos nós por página.
const CASA = `${siteUrl}/#casa`;
const ACOMODACAO = `${siteUrl}/#acomodacao`;
const SITE = `${siteUrl}/#website`;

const absoluta = (caminho: string) => `${siteUrl}${caminho}`;

/**
 * Uma foto por ambiente, capa primeiro. Cobre a casa inteira sem repetir, e os
 * dois PNGs de ~1,8 MB ficam de fora — são originais sem otimização.
 */
function fotosDestaque(casa: Casa) {
  const vistos = new Set<string>();
  return casa.fotos
    .filter((f) => !f.arquivo.endsWith(".png"))
    .filter((f) => !vistos.has(f.ambiente) && vistos.add(f.ambiente))
    .map((f) => absoluta(f.arquivo));
}

/**
 * O nó da casa: sai idêntico nos três idiomas, de propósito.
 *
 * Três definições traduzidas sob o mesmo @id seriam três afirmações
 * conflitantes sobre a mesma entidade, e quem mescla decide qual vence. Por
 * isso a descrição é sempre a versão pt-BR e o nome não é traduzido.
 */
function noCasa(casa: Casa, diaria: number, faixa: { min: number; max: number }) {
  const { endereco, links } = casa;
  const sameAs = [links.googleMaps, links.airbnb].filter(Boolean);

  return {
    "@type": ["VacationRental", "LodgingBusiness"],
    "@id": CASA,
    name: casa.nome,
    description: pt.meta.description,
    url: absoluta("/pt"),
    image: fotosDestaque(casa),
    logo: absoluta("/logo.png"),
    address: {
      "@type": "PostalAddress",
      // Sem streetAddress: a página avisa que o endereço exato só vai depois
      // da reserva confirmada, e marcar o que não está visível é infração.
      addressLocality: endereco.cidade,
      addressRegion: endereco.estado,
      addressCountry: endereco.pais,
    },
    containedInPlace: { "@type": "Place", name: endereco.bairro },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(casa.mapa.latitude.toFixed(6)),
      longitude: Number(casa.mapa.longitude.toFixed(6)),
    },
    ...(links.googleMaps && { hasMap: links.googleMaps }),
    ...(sameAs.length && { sameAs }),
    // E.164: o valor cru em casa.json é um ID de WhatsApp, não um telefone.
    telephone: `+${casa.contato.whatsapp}`,
    email: casa.contato.emails[0],
    petsAllowed: casa.petFriendly,
    smokingAllowed: false,
    checkinTime: casa.regras.checkIn,
    checkoutTime: casa.regras.checkOut,
    currenciesAccepted: "BRL",
    knowsLanguage: locales.map((l) => intlLocale[l]),
    priceRange: `R$ ${faixa.min}–${faixa.max}`,
    makesOffer: {
      // AggregateOffer e não Offer: R$ 576 é o piso de uma tabela que vai até
      // R$ 2340, então "price" afirmaria algo falso na maioria das datas.
      "@type": "AggregateOffer",
      lowPrice: diaria,
      highPrice: faixa.max,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: absoluta("/pt/reservar"),
      itemOffered: { "@id": ACOMODACAO },
      eligibleQuantity: {
        "@type": "QuantitativeValue",
        minValue: casa.precos.minimoNoites,
        unitCode: "DAY",
      },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: diaria,
        priceCurrency: "BRL",
        unitCode: "DAY",
      },
    },
    containsPlace: { "@id": ACOMODACAO },
  };
}

/** A unidade em si. Tudo que é de quarto/cama/ocupação vive aqui, não no negócio. */
function noAcomodacao(casa: Casa) {
  return {
    "@type": "Accommodation",
    "@id": ACOMODACAO,
    name: casa.nome,
    numberOfBedrooms: casa.capacidade.quartos,
    numberOfBathroomsTotal: casa.capacidade.banheiros,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: casa.capacidade.hospedes,
      unitText: "person",
    },
    bed: casa.camas.map((c) => ({
      "@type": "BedDetails",
      typeOfBed: c.tipo,
      numberOfBeds: c.quantidade,
    })),
    amenityFeature: comodidadesAtivas(casa).map((c) => ({
      "@type": "LocationFeatureSpecification",
      name: c.schemaName,
      value: true,
    })),
  };
}

/** Grafo da home: casa + acomodação + site (fixos) e página + FAQ (por idioma). */
export function grafoHome(
  lang: Locale,
  dict: Dictionary,
  casa: Casa,
  diaria: number,
  faixa: { min: number; max: number },
) {
  const pagina = `${siteUrl}/${lang}#webpage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      noCasa(casa, diaria, faixa),
      noAcomodacao(casa),
      {
        "@type": "WebSite",
        "@id": SITE,
        url: siteUrl,
        name: casa.nome,
        publisher: { "@id": CASA },
        inLanguage: locales.map((l) => intlLocale[l]),
      },
      {
        "@type": "WebPage",
        "@id": pagina,
        url: absoluta(`/${lang}`),
        name: dict.meta.title,
        description: dict.meta.description,
        inLanguage: intlLocale[lang],
        isPartOf: { "@id": SITE },
        about: { "@id": CASA },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: absoluta(casa.fotos[0].arquivo),
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/${lang}#faq`,
        inLanguage: intlLocale[lang],
        isPartOf: { "@id": pagina },
        mainEntity: dict.faq.itens.map((item) => ({
          "@type": "Question",
          name: item.p,
          acceptedAnswer: { "@type": "Answer", text: item.r },
        })),
      },
    ],
  };
}
