import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  pt: () => import("./dictionaries/pt.json").then((m) => m.default),
  es: () => import("./dictionaries/es.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["pt"]>>;

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
