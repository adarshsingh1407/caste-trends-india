/**
 * Single source of truth for category → color mapping, used by every chart/stat-tile
 * across the app. All values are CSS custom properties (defined in index.css), never
 * literal hex/rgb -- so a full visual theme swap only ever requires editing index.css,
 * not this file or any component.
 *
 * "Others" (the term Income/Wealth's source surveys use) and "General"/"General/Other"
 * (the term Representation uses for the same DoPT/AISHE residual) are intentionally the
 * same color -- they're the same category by a different name depending on source.
 */
export type Category = "SC" | "ST" | "OBC" | "General" | "Others" | "All";

export const CATEGORY_COLOR: Record<Category, string> = {
  SC: "var(--color-sc)",
  ST: "var(--color-st)",
  OBC: "var(--color-obc)",
  General: "var(--color-general)",
  Others: "var(--color-general)",
  All: "var(--color-all)",
};
