import { ToolGridSkeleton } from "./tool-grid-skeleton"

/**
 * Page-level loading state for /ai-tools.
 * Renders a static shell (heading, search placeholder) plus a skeleton grid
 * so the LCP element (the h1) paints immediately while data streams in.
 */
export default function AiToolsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">AI Tools Directory</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Loading tools AI untuk produktivitas dan kreativitas Anda…
        </p>
      </div>

      {/* Search placeholder */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="h-10 flex-1 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Filter placeholder */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <ToolGridSkeleton count={8} />
    </div>
  )
}
