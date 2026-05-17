import { Skeleton } from "@/components/ui/skeleton"

export default function PublicRoutesLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      {/* Hero / page header skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full max-w-lg" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-4 space-y-3">
            <Skeleton className="h-36 w-full rounded-lg" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
