// Four minimalist Japanese dragon outlines fixed in screen corners.
// Pure decoration: pointer-events-none, low opacity, never blocks content.

const Dragon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    stroke="#e63946"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Stylized dragon: coiled body + head + whiskers */}
    <path d="M30 150 C 50 130, 40 100, 70 95 C 100 90, 110 120, 140 110 C 165 102, 170 80, 155 65 C 142 52, 120 58, 118 75" />
    <path d="M118 75 C 117 85, 125 92, 135 88" />
    {/* Head */}
    <path d="M150 55 C 162 50, 175 55, 178 68 C 180 78, 172 86, 162 84 L 158 80" />
    <circle cx="167" cy="65" r="1.6" fill="#e63946" stroke="none" />
    {/* Whiskers */}
    <path d="M178 70 C 188 72, 192 78, 188 86" />
    <path d="M175 78 C 184 84, 184 92, 178 96" />
    {/* Spines */}
    <path d="M70 95 l -4 -8 M85 92 l -3 -9 M100 95 l -2 -10 M115 100 l -1 -10 M130 108 l 1 -10" />
    {/* Tail */}
    <path d="M30 150 C 22 158, 22 168, 30 172 C 38 175, 44 168, 42 160" />
  </svg>
);

export function CornerDragons() {
  const base = "fixed w-32 h-32 sm:w-44 sm:h-44 pointer-events-none select-none z-0";
  return (
    <div className="pointer-events-none" style={{ opacity: 0.15 }} aria-hidden="true">
      <Dragon className={`${base} top-0 left-0`} />
      <Dragon className={`${base} top-0 right-0 -scale-x-100`} />
      <Dragon className={`${base} bottom-0 left-0 -scale-y-100`} />
      <Dragon className={`${base} bottom-0 right-0 scale-x-[-1] scale-y-[-1]`} />
    </div>
  );
}
