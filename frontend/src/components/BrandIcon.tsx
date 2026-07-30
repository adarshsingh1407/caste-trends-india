/** Same mark as the favicon/OG image: dark badge, "C" monogram, three tone-color bars. */
export function BrandIcon() {
  return (
    <svg className="brand-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0d0d0d" />
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fontFamily="-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="38"
        fontWeight="700"
        fill="#ffffff"
      >
        C
      </text>
      <rect x="16" y="52" width="8" height="4" rx="2" fill="#0ca30c" />
      <rect x="28" y="52" width="8" height="4" rx="2" fill="#fab219" />
      <rect x="40" y="52" width="8" height="4" rx="2" fill="#e66767" />
    </svg>
  );
}
