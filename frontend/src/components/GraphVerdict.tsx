import { ThumbIcon } from "./ThumbIcon";

type Tone = "positive" | "negative" | "neutral";

/**
 * Small compact verdict caption for a single chart. `direction` always reflects the
 * literal numeric direction of the underlying metric (arrow never contradicts the number);
 * `tone` is a separate judgment of whether that direction is favorable, unfavorable, or
 * neither -- pass "neutral" for purely descriptive contexts (e.g. Juxtaposition, where the
 * page's whole point is to avoid implying a value judgment).
 */
export function GraphVerdict({
  direction,
  tone,
  children,
}: {
  direction: "up" | "down";
  tone: Tone;
  children: React.ReactNode;
}) {
  const color =
    tone === "positive" ? "var(--color-positive)" : tone === "negative" ? "var(--color-negative)" : "var(--color-text-muted)";
  const arrow = direction === "up" ? "▲" : "▼";
  return (
    <p
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        color,
        margin: "10px 0 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>
        {arrow} {children}
      </span>
      {tone !== "neutral" && <ThumbIcon tone={tone} />}
    </p>
  );
}
