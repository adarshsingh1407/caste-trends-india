import { ReactNode, useState } from "react";

/** Collapsible "how to read this" note, placed under a chart/widget title. Closed by default. */
export function ChartHelp({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="chart-help">
      <button type="button" className="chart-help-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span aria-hidden="true">ⓘ</span> How to read this
      </button>
      {open && <div className="chart-help-body">{children}</div>}
    </div>
  );
}
