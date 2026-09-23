/**
 * Marca da Casa Brisa: um stand-up paddle no mar calmo da Daniela.
 * As cores saem dos tokens do tema (globals.css).
 *
 * A mesma arte, com as cores fixas, está em app/icon.svg (favicon) e
 * public/logo.svg (uso externo) — se mexer aqui, mexa nos três.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <circle cx="32" cy="32" r="32" fill="var(--color-terracota)" />
      <g
        stroke="var(--color-branco)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* remo */}
        <path d="M29 20 44.5 44.5" strokeWidth="2.4" />
        {/* tronco e pernas */}
        <path d="M24.8 21.5 25.8 31.5" strokeWidth="5" />
        <path d="M25.8 31.5 23 42" strokeWidth="3.2" />
        <path d="M25.8 31.5 28.3 42" strokeWidth="3.2" />
        {/* braços */}
        <path d="M24.9 23 28.8 20.4" strokeWidth="2.9" />
        <path d="M25.4 25.6 34 27.9" strokeWidth="2.9" />
      </g>
      {/* pá do remo */}
      <ellipse
        cx="45.9"
        cy="46.8"
        rx="2.1"
        ry="4"
        fill="var(--color-branco)"
        transform="rotate(-32.3 45.9 46.8)"
      />
      <circle cx="25" cy="18.2" r="3.2" fill="var(--color-branco)" />
      {/* prancha e água */}
      <path d="M8 45q17-4.5 34 0-17 4.5-34 0z" fill="var(--color-branco)" />
      <path
        d="M17 52q4.5-2.6 9 0t9 0t9 0"
        stroke="var(--color-branco)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".45"
      />
    </svg>
  );
}
