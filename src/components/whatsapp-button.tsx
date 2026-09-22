import { MessageCircle } from "lucide-react";

type Props = { numero: string; mensagem: string; aria: string };

/** Botão flutuante do WhatsApp, acima da barra de reserva. Escondido se não houver número. */
export function WhatsAppButton({ numero, mensagem, aria }: Props) {
  if (!numero) return null;
  const href = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
      className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-suave transition active:scale-95"
    >
      <MessageCircle className="size-7" strokeWidth={2} />
    </a>
  );
}
