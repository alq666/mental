import type { CSSProperties } from "react";
import { VARIANTS } from "./variants";

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
