import type { CSSProperties } from "react";

export type VariantCard = {
  href: string;
  mark: string;
  name: string;
  blurb: string;
  /** BCP 47 tag for the card's own name, so screen readers pronounce it correctly. */
  lang?: string;
  accent: string;
};

// One card per themed game. The accent is that variant's own ink, lightened enough to
// read on the hub's dark surface.
const VARIANTS: VariantCard[] = [
  {
    href: "/roman",
    mark: "🏛️",
    name: "Numeralia",
    blurb: "Latin in the Forum; laurels from first spark to Caesar's crown.",
    lang: "la",
    accent: "#b4623f",
  },
  {
    href: "/france",
    mark: "⚜️",
    name: "Le Comptoir des Nombres",
    blurb: "Fifteenth-century French, from page to the coronation at Reims.",
    lang: "fr",
    accent: "#5a7ae0",
  },
  {
    href: "/tang",
    mark: "🏯",
    name: "大唐算學館",
    blurb: "Classical Chinese and the imperial mathematics examination.",
    lang: "zh-Hant",
    accent: "#d1495b",
  },
  {
    href: "/soccer",
    mark: "⚽",
    name: "Penalty shootout",
    blurb: "Twenty kicks, one World Cup — the keeper dives either way.",
    accent: "#46b96b",
  },
  {
    href: "/muromachi",
    mark: "⛩️",
    name: "室町算術道場",
    blurb: "Kanbun arithmetic in the Kyoto of the Ashikaga.",
    lang: "ja",
    accent: "#7f9cc4",
  },
  {
    href: "/baghdad",
    mark: "🕌",
    name: "بيت الحكمة",
    blurb: "Arabic in the House of Wisdom, with an astrolabe per rank.",
    lang: "ar",
    accent: "#4a94c8",
  },
  {
    href: "/byzantium",
    mark: "☧",
    name: "Ἡ Ἀριθμητική",
    blurb: "Greek in the queen city; laurels from the Hippodrome.",
    lang: "el",
    accent: "#c05a7a",
  },
];

/**
 * The gallery of themed games on the classic setup screen. Each card carries the
 * variant's own accent as a custom property, so the CSS stays theme-agnostic.
 */
export function VariantGallery() {
  return (
    <div className="world-grid">
      {VARIANTS.map((variant) => (
        <a
          key={variant.href}
          href={variant.href}
          className="world-card variant-link"
          style={{ "--world-accent": variant.accent } as CSSProperties}
        >
          <span className="world-mark" lang={variant.lang} aria-hidden="true">{variant.mark}</span>
          <span className="world-copy">
            <strong lang={variant.lang}>{variant.name}</strong>
            <small>{variant.blurb}</small>
          </span>
          <span className="world-arrow" aria-hidden="true">→</span>
        </a>
      ))}
    </div>
  );
}
