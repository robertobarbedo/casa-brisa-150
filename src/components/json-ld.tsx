/**
 * Dado estruturado, renderizado direto no HTML.
 *
 * Não usar next/script: ele injeta pelo cliente, e crawler que não roda
 * JavaScript — boa parte dos de IA — não veria nada.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // O único risco real é um "</script>" vindo de dentro do JSON.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
    />
  );
}
