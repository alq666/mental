import "./ModePicker.css";
import { MODE_ORDER, type Mode } from "./useStreakGame";

export type ModeLabels = Record<Mode, string>;

/**
 * Three-way choice between posing the question as a product, a missing factor, or a
 * division. Shared by every variant so the modes stay identical across themes; the
 * labels are passed in the variant's own language. Deliberately palette-neutral — it
 * draws in `currentColor` so each variant's setup card colours it.
 */
export function ModePicker({
  value,
  onChange,
  label,
  labels,
  hint,
}: {
  value: Mode;
  onChange: (mode: Mode) => void;
  label: string;
  labels: ModeLabels;
  hint?: string;
}) {
  return (
    <div className="mode-picker" role="group" aria-label={label}>
      <span className="mode-picker-label">{label}</span>
      <div className="mode-picker-options">
        {MODE_ORDER.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`mode-option ${value === mode ? "mode-on" : ""}`}
            aria-pressed={value === mode}
            onClick={() => onChange(mode)}
          >
            {labels[mode]}
          </button>
        ))}
      </div>
      {hint && <small className="mode-picker-hint">{hint}</small>}
    </div>
  );
}
