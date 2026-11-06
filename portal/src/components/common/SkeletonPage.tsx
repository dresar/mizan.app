/**
 * SkeletonPage — Ultra-lightweight, non-intrusive fallback for React.lazy Suspense.
 * NO spinners. NO blocking overlays. Just structural shimmering placeholders.
 */
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-md bg-muted/60 ${className}`}
    aria-hidden="true"
  />
);

export default function SkeletonPage() {
  return (
    <div className="space-y-6 p-6 w-full" aria-busy="true" aria-label="Memuat halaman...">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-48" />
          <Shimmer className="h-4 w-72" />
        </div>
        <Shimmer className="h-9 w-28" />
      </div>

      {/* Table/Card skeleton */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        {/* Toolbar row */}
        <div className="flex items-center gap-3 pb-2">
          <Shimmer className="h-9 w-56" />
          <Shimmer className="h-9 w-32" />
          <Shimmer className="h-9 w-32" />
        </div>

        {/* Table header */}
        <div className="flex items-center gap-4 py-2 border-b">
          <Shimmer className="h-4 w-4" />
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-4 w-20 ml-auto" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-16" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Shimmer className="h-4 w-4" />
            <div className="flex items-center gap-3">
              <Shimmer className="h-9 w-9 rounded-full" />
              <div className="space-y-1">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
            <Shimmer className="h-5 w-16 ml-auto rounded-full" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
