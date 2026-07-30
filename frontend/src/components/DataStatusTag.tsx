type Status = "reported" | "computed" | "reconstructed" | "projected";

const STATUS_LABEL: Record<Status, string> = {
  reported: "Directly reported",
  computed: "Computed from reported figures",
  reconstructed: "Reconstructed from source chart",
  projected: "Projected / estimated",
};

// Fixed status palette -- reserved, never reused for a category or series color.
// Roughly a trust/certainty gradient: reported (most direct) -> computed (low-risk
// arithmetic) -> reconstructed (recovered, cross-checked) -> projected (modeled, least direct).
const STATUS_COLOR: Record<Status, string> = {
  reported: "var(--status-good)",
  computed: "var(--color-text-muted)",
  reconstructed: "var(--status-warning)",
  projected: "var(--status-critical)",
};

export function DataStatusTag({ status }: { status: Status }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        color: STATUS_COLOR[status],
        border: `1px solid ${STATUS_COLOR[status]}`,
        borderRadius: 5,
        padding: "1px 7px",
        marginRight: 6,
        marginBottom: 4,
      }}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
