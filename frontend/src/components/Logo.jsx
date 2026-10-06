/**
 * Isotipo de B-Side en SVG.
 * Recreación simplificada basada en el manual de marca 2026.
 */
function Logo({ size = 40, className = "" }) {
  return (
    <svg
      width={size * 2.4}
      height={size}
      viewBox="0 0 120 50"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="B-Side"
    >
      {/* Forma principal (B estilizada con ojos) */}
      <path
        d="M 5 12 Q 5 5 12 5 L 38 5 Q 45 5 45 12 L 45 25 Q 45 32 38 32 L 32 32 Q 30 38 24 38 Q 18 38 16 32 L 12 32 Q 5 32 5 25 Z
           M 46 8 L 54 8 Q 56 8 56 10 L 56 12 Q 56 14 54 14 L 46 14 Q 44 14 44 12 L 44 10 Q 44 8 46 8 Z"
        fill="currentColor"
      />
      {/* Ojos */}
      <circle cx="16" cy="19" r="3" fill="white" />
      <circle cx="32" cy="19" r="3" fill="white" />
      {/* Sonrisa */}
      <path
        d="M 20 40 Q 24 44 28 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Texto "SIDE" */}
      <text
        x="60"
        y="35"
        fontFamily="Baloo 2, sans-serif"
        fontSize="28"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-1"
      >
        SIDE
      </text>
    </svg>
  );
}

export default Logo;