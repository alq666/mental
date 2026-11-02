import type { EquationToken } from "./useStreakGame";

/**
 * Renders the five slots of the question with the markup every variant already styles:
 * operands as <span>, operators as <i>, the hidden number as <b>. Keeping the tags
 * uniform is what lets one mode picker serve all themes.
 */
export function EquationSlots({ tokens }: { tokens: EquationToken[] }) {
  return (
    <>
      {tokens.map((token, index) =>
        token.kind === "operator"
          ? <i key={index}>{token.text}</i>
          : token.kind === "unknown"
            ? <b key={index}>{token.text}</b>
            : <span key={index}>{token.text}</span>
      )}
    </>
  );
}
