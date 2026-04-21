export default function PublicRoutesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-9 w-72 animate-pulse rounded bg-muted" />
      <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
