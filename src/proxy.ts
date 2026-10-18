import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";
import { MOEDA_COOKIE } from "@/lib/moeda";

/** Escolhe o idioma pelo cookie (escolha anterior) ou usa o idioma padrão. */
function getLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("locale")?.value;
  if (saved && hasLocale(saved)) return saved;

  return defaultLocale;
}

/**
 * Moeda inicial pelo país do visitante (a Vercel informa pelo IP): fora do Brasil, dólar.
 * Só na primeira visita: depois vale o cookie, que o botão R$/US$ também troca.
 */
function definirMoeda(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(MOEDA_COOKIE)) return response;
  const pais = request.headers.get("x-vercel-ip-country");
  if (!pais) return response;
  response.cookies.set(MOEDA_COOKIE, pais === "BR" ? "BRL" : "USD", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (pathnameHasLocale) return definirMoeda(request, NextResponse.next());

  // QR code dos cartazes: primeiro o hóspede escolhe o idioma (app/bem-vindos).
  // Se já escolheu antes, vai direto (menos quando veio do globo, ?idioma, para trocar).
  if (pathname === "/bem-vindos") {
    if (request.nextUrl.searchParams.has("idioma")) return;
    const saved = request.cookies.get("locale")?.value;
    if (!saved || !hasLocale(saved)) return;
  }

  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`;
  return definirMoeda(request, NextResponse.redirect(request.nextUrl));
}

export const config = {
  // Ignora internos do Next, API e arquivos com extensão (imagens, ícones...)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
