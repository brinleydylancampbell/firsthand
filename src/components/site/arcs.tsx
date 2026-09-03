/**
 * Firsthand's quiet motif: the two speech arcs from the mark, drawn large and
 * faint in the ink bands, radially masked so they never touch an edge.
 */
export function Arcs({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 600 600"
      className={className}
      style={{ maskImage: "radial-gradient(closest-side at 50% 50%, black 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(closest-side at 50% 50%, black 40%, transparent 100%)" }}
    >
      <path d="M330 130 C 470 230, 470 370, 330 470" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
      <path d="M400 70 C 600 210, 600 390, 400 530" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
    </svg>
  );
}
