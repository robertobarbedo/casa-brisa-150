import { Logo } from "@/components/logo";
import { EscolherIdioma } from "@/components/bem-vindos/escolher-idioma";

/** Primeira tela do QR code: escolher o idioma. */
export default function Escolha() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pt-[env(safe-area-inset-top)] pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="relative mx-auto mb-8">
        <div aria-hidden className="absolute inset-0 -z-10 scale-150 rounded-full bg-azul-suave blur-2xl" />
        <Logo className="size-24 drop-shadow-sm" />
      </div>
      <h1 className="text-center text-3xl leading-tight font-bold tracking-tight text-taupe-escuro">
        Bem-vindos
        <span className="block text-xl font-semibold text-taupe/80">Bienvenidos · Welcome</span>
      </h1>
      <EscolherIdioma />
    </main>
  );
}
