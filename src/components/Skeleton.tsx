export function CardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="aspect-square animate-pulse rounded-lg border border-white/10 bg-[#111] shadow-[0_0_24px_rgba(255,255,255,0.025)]"
    >
      <div className="m-3 h-3 w-1/2 rounded bg-white/10" />
      <div className="mx-3 mt-5 h-24 rounded bg-white/5" />
      <div className="mx-3 mt-3 h-3 w-3/4 rounded bg-white/10" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
