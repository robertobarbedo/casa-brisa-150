import {
  Bath,
  BedDouble,
  Car,
  ChevronDown,
  Clock,
  CookingPot,
  DoorOpen,
  Flame,
  MapPin,
  PawPrint,
  Tag,
  Trees,
  Users,
  Waves,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Ambiente, Casa } from "@/lib/casa";
import { fill } from "@/lib/format";
import { Foto } from "./foto";

type Base = { dict: Dictionary; casa: Casa };

/** Primeira foto do ambiente, usada como miniatura na lista de espaços. */
const fotoDe = (casa: Casa, ambiente: Ambiente) =>
  casa.fotos.find((f) => f.ambiente === ambiente)?.arquivo;

function Titulo({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="scroll-mt-20 text-2xl font-bold tracking-tight text-taupe-escuro">
      {children}
    </h2>
  );
}

function Selo({ icon: Icon, children, tom }: { icon: LucideIcon; children: React.ReactNode; tom: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${tom}`}>
      <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      {children}
    </span>
  );
}

export function Hero({ dict, casa }: Base) {
  const { capacidade: c } = casa;
  const capa = casa.fotos[0];
  const destaques: { icon: LucideIcon; texto: string }[] = [
    { icon: Users, texto: fill(dict.destaques.hospedes, { n: c.hospedes }) },
    { icon: BedDouble, texto: fill(dict.destaques.quartos, { n: c.quartos }) },
    { icon: DoorOpen, texto: fill(dict.destaques.suite, { n: c.suites }) },
    { icon: Bath, texto: fill(dict.destaques.banheiros, { n: c.banheiros }) },
  ];

  return (
    <section className="mx-auto max-w-5xl md:grid md:grid-cols-2 md:items-center md:gap-10 md:px-4 md:pt-8">
      <Foto
        label={dict.fotos[capa.ambiente]}
        arquivo={capa.arquivo}
        priority
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[5/4] w-full rounded-b-[var(--radius-brisa)] md:aspect-square md:canto-brisa md:rounded-br-[4rem]"
      />

      <div className="px-4 pt-6 md:px-0 md:pt-0">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-terracota-forte">
          <MapPin aria-hidden className="size-4" />
          {dict.hero.local}
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight text-taupe-escuro md:text-4xl">
          {dict.hero.titulo}
        </h1>
        <p className="mt-3 text-base leading-relaxed">{dict.hero.subtitulo}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Selo icon={Waves} tom="bg-azul-suave text-taupe-escuro">{dict.hero.selos.praia}</Selo>
          {casa.carregadorEletrico && (
            <Selo icon={Zap} tom="bg-terracota-suave text-terracota-forte">{dict.hero.selos.eletrico}</Selo>
          )}
          {casa.petFriendly && (
            <Selo icon={PawPrint} tom="bg-areia text-taupe-escuro">{dict.hero.selos.pet}</Selo>
          )}
          {casa.precos.descontoPercentual > 0 && (
            <Selo icon={Tag} tom="bg-folha/15 text-folha-forte">
              {fill(dict.reserva.selo, { n: casa.precos.descontoPercentual })}
            </Selo>
          )}
        </div>

        <ul className="mt-6 grid grid-cols-4 gap-2 border-y border-areia-escura py-4 text-center">
          {destaques.map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex flex-col items-center gap-1.5 text-xs font-semibold">
              <Icon aria-hidden className="size-6 text-terracota" strokeWidth={1.5} />
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Galeria({ dict, casa }: Base) {
  return (
    <section aria-labelledby="galeria" className="mx-auto max-w-5xl pt-10">
      <div className="flex items-baseline justify-between px-4">
        <Titulo id="galeria">{dict.galeria.titulo}</Titulo>
        <span className="text-xs text-taupe/70 md:hidden">{dict.galeria.dica} →</span>
      </div>
      {/* Carrossel no celular, grade no desktop: são muitas fotos para uma fila só. */}
      <ul className="sem-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
        {casa.fotos.map((f) => (
          <li key={f.arquivo} className="w-[78%] shrink-0 snap-start sm:w-[45%] md:w-auto">
            <Foto
              label={dict.fotos[f.ambiente]}
              arquivo={f.arquivo}
              sizes="(min-width: 768px) 33vw, 80vw"
              className="canto-brisa aspect-[4/3] w-full"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Sobre({ dict, casa }: Base) {
  return (
    <section aria-labelledby="casa" className="mx-auto max-w-5xl px-4 pt-10">
      <Titulo id="casa">{dict.sobre.titulo}</Titulo>
      <div className="mt-3 space-y-3 leading-relaxed md:max-w-2xl">
        {dict.sobre.texto.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <h3 className="mt-8 text-lg font-bold text-taupe-escuro">{dict.ambientes.titulo}</h3>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {dict.ambientes.itens.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-areia/60 p-2 pr-4">
            <Foto
              label={dict.fotos[a.id as Ambiente]}
              arquivo={fotoDe(casa, a.id as Ambiente)}
              sizes="96px"
              className="size-20 shrink-0 rounded-xl [&_span]:hidden [&_svg]:size-5"
            />
            <div>
              <p className="font-bold text-taupe-escuro">{a.titulo}</p>
              <p className="text-sm leading-snug">{a.texto}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Comodidades({ dict, casa }: Base) {
  const i = dict.comodidades.itens;
  const itens: { icon: LucideIcon; texto: string; ativo: boolean }[] = [
    { icon: Waves, texto: i.praia, ativo: true },
    { icon: Zap, texto: i.eletrico, ativo: casa.carregadorEletrico },
    { icon: PawPrint, texto: i.pet, ativo: casa.petFriendly },
    { icon: Wifi, texto: i.wifi, ativo: true },
    { icon: CookingPot, texto: i.cozinha, ativo: true },
    { icon: Flame, texto: i.churrasqueira, ativo: true },
    { icon: Trees, texto: i.jardim, ativo: true },
    { icon: Car, texto: i.estacionamento, ativo: true },
  ];

  return (
    <section aria-labelledby="comodidades" className="mx-auto max-w-5xl px-4 pt-10">
      <Titulo id="comodidades">{dict.comodidades.titulo}</Titulo>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 md:grid-cols-4">
        {itens
          .filter((c) => c.ativo)
          .map(({ icon: Icon, texto }) => (
            <li key={texto} className="flex items-center gap-3 text-sm font-semibold">
              <Icon aria-hidden className="size-5 shrink-0 text-terracota" strokeWidth={1.75} />
              {texto}
            </li>
          ))}
      </ul>

      {casa.carregadorEletrico && (
        <div className="canto-brisa mt-8 flex gap-4 bg-azul-suave p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-branco text-terracota-forte">
            <Zap aria-hidden className="size-6" />
          </span>
          <div>
            <p className="font-bold text-taupe-escuro">{dict.eletrico.titulo}</p>
            <p className="mt-1 text-sm leading-relaxed">{dict.eletrico.texto}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export function Regiao({ dict, casa }: Base) {
  // Mostra só a região: o centro do mapa é deslocado e um círculo cobre a área.
  // O endereço exato só vai para o hóspede depois da reserva confirmada.
  const centroLat = casa.mapa.latitude + 0.0003;
  const centroLon = casa.mapa.longitude - 0.0004;
  const d = 0.0022; // enquadramento fechado na quadra
  const bbox = [centroLon - d, centroLat - d, centroLon + d, centroLat + d].join(",");

  return (
    <section aria-labelledby="regiao" className="mx-auto max-w-5xl pt-10">
      <div className="px-4">
        <Titulo id="regiao">{dict.regiao.titulo}</Titulo>
        <p className="mt-2 leading-relaxed md:max-w-2xl">{dict.regiao.intro}</p>
      </div>

      <ul className="sem-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2">
        {dict.regiao.itens.map((r) => (
          <li key={r.titulo} className="canto-brisa w-[70%] shrink-0 snap-start bg-areia p-4 sm:w-[40%] md:w-[24%]">
            <p className="font-bold text-taupe-escuro">{r.titulo}</p>
            <p className="mt-1 text-sm leading-snug">{r.texto}</p>
          </li>
        ))}
      </ul>

      <div className="px-4 pt-8">
        <h3 className="text-lg font-bold text-taupe-escuro">{dict.mapa.titulo}</h3>
        <div className="canto-brisa relative mt-3 overflow-hidden bg-areia">
          <iframe
            title={dict.mapa.titulo}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
            loading="lazy"
            className="pointer-events-none block aspect-[4/3] w-full border-0 md:aspect-[16/7]"
          />
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 aspect-square w-[19%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-terracota/70 bg-terracota/20 md:w-[10%]"
          />
        </div>
        <p className="mt-2 text-xs text-taupe/80">{dict.mapa.aviso}</p>
      </div>
    </section>
  );
}

export function Regras({ dict }: { dict: Dictionary }) {
  const r = dict.regras;
  return (
    <section aria-labelledby="regras" className="mx-auto max-w-5xl px-4 pt-10">
      <Titulo id="regras">{r.titulo}</Titulo>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          [r.checkin, r.checkinHora],
          [r.checkout, r.checkoutHora],
        ].map(([rotulo, hora]) => (
          <div key={rotulo} className="rounded-2xl border border-areia-escura p-4">
            <Clock aria-hidden className="size-5 text-terracota" />
            <p className="mt-2 text-xs font-semibold tracking-wide uppercase">{rotulo}</p>
            <p className="font-bold text-taupe-escuro">{hora}</p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {r.itens.map((item) => (
          <li key={item} className="flex gap-3 text-sm">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-terracota" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq({ dict }: { dict: Dictionary }) {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-5xl px-4 pt-10">
      <Titulo id="faq">{dict.faq.titulo}</Titulo>
      <div className="mt-4 divide-y divide-areia-escura border-y border-areia-escura md:max-w-2xl">
        {dict.faq.itens.map((item) => (
          <details key={item.p} className="group">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold text-taupe-escuro [&::-webkit-details-marker]:hidden">
              {item.p}
              <ChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed">{item.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Rodape({ dict, casa }: Base) {
  return (
    <footer className="mt-12 bg-areia px-4 pt-8 pb-36 text-center text-sm">
      <p className="text-lg font-bold text-taupe-escuro">{casa.nome}</p>
      <p className="mt-1">{dict.rodape.texto}</p>
      <p className="mt-4 text-xs text-taupe/70">
        © {new Date().getFullYear()} {casa.nome}. {dict.rodape.direitos}
      </p>
    </footer>
  );
}
