import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";

/** Escolhe o idioma pelo cookie (escolha anterior) ou usa o idioma padrão. */
function getLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("locale")?.value;
  if (saved && hasLocale(saved)) return saved;

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Ignora internos do Next, API e arquivos com extensão (imagens, ícones...)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
