import Image from "next/image";
import { Camera } from "lucide-react";

type FotoProps = {
  label: string;
  /** Caminho em /public (ex.: "/fotos/cozinha.webp"). Vazio mostra o placeholder. */
  arquivo?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Foto da casa, ou um placeholder com o nome do ambiente enquanto não há foto real. */
export function Foto({ label, arquivo, className = "", sizes = "100vw", priority }: FotoProps) {
  if (arquivo) {
    return (
      <div className={`relative overflow-hidden bg-areia ${className}`}>
        <Image src={arquivo} alt={label} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-gradient-to-br from-areia to-areia-escura text-taupe/70 ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgb(111_94_79/0.15)_1px,transparent_0)] [background-size:14px_14px]"
      />
      <Camera aria-hidden className="relative size-7" strokeWidth={1.5} />
      <span className="relative text-sm font-semibold tracking-wide">{label}</span>
    </div>
  );
}
