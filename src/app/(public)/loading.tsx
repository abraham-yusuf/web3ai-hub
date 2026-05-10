function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
}

export default function PublicRoutesLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="rounded-3xl border bg-card p-6">
        <SkeletonBlock className="h-5 w-28" />
        <SkeletonBlock className="mt-4 h-9 w-full max-w-lg" />
        <SkeletonBlock className="mt-3 h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-2xl border p-4">
            <SkeletonBlock className="h-32 w-full" />
            <SkeletonBlock className="mt-4 h-5 w-4/5" />
            <SkeletonBlock className="mt-2 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
