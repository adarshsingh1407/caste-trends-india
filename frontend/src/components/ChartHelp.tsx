import { ReactNode, useState } from "react";

/** Icon-only "how to read this" toggle, pinned to the top-right corner of the enclosing .card. Closed by default. */
export function ChartHelp({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="card-info-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="How to read this"
      >
        ⓘ
      </button>
      {open && <div className="chart-help-body">{children}</div>}
    </>
  );
}
