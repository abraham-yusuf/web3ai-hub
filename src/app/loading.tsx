function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
}

export default function RootLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <SkeletonBlock className="h-5 w-32" />
        <SkeletonBlock className="h-10 w-full max-w-xl" />
        <SkeletonBlock className="h-5 w-full max-w-3xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border p-4">
            <SkeletonBlock className="h-10 w-10" />
            <SkeletonBlock className="mt-5 h-5 w-3/4" />
            <SkeletonBlock className="mt-3 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
      <SkeletonBlock className="h-48 w-full" />
    </div>
  )
}
