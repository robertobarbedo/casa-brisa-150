import Script from "next/script";

const GA_ID = "G-LHR7MT7D8P";
/** Google Ads: as conversões vêm importadas do GA4; esta tag só liga cliques do anúncio e públicos. */
const ADS_ID = "AW-10908704715";

/**
 * Google Analytics (GA4) e Google Ads, na mesma gtag. Vão nos dois layouts raiz: o do site ([lang]) e o da
 * escolha de idioma do QR code (/bem-vindos). Só em produção, para o `next dev`
 * não sujar os números. Trocas de página no cliente o GA4 já conta sozinho
 * (medição otimizada → mudanças no histórico).
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');gtag('config','${ADS_ID}');`}
      </Script>
    </>
  );
}
