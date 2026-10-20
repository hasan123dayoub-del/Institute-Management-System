// Six rising steps (A1 to C2) with a climbing arrow. Colour follows currentColor for the arrow.
export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Ascend logo">
      <rect x="5" y="44" width="7" height="12" rx="2" fill="#4A6FA5" opacity=".5" />
      <rect x="14" y="38" width="7" height="18" rx="2" fill="#4A6FA5" opacity=".62" />
      <rect x="23" y="32" width="7" height="24" rx="2" fill="#4A6FA5" opacity=".74" />
      <rect x="32" y="26" width="7" height="30" rx="2" fill="#4A6FA5" opacity=".86" />
      <rect x="41" y="20" width="7" height="36" rx="2" fill="#4A6FA5" />
      <rect x="50" y="14" width="7" height="42" rx="2" fill="#F2A97F" />
      <path d="M7 33 L44 9.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M36.5 8.5 L44.5 9.5 L41 16.8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}
