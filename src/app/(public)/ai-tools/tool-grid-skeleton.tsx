import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Skeleton that mirrors the exact layout of the real tool grid.
 * Prevents CLS by reserving the same vertical space while data loads.
 */
export function ToolGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex h-full flex-col animate-pulse">
          <CardHeader>
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="h-5 w-20 rounded-full bg-muted" />
              <div className="h-5 w-12 rounded bg-muted" />
            </div>
            <div className="flex flex-wrap gap-1">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-14 rounded-full bg-muted" />
            </div>
            <div className="mt-2 h-5 w-3/4 rounded bg-muted" />
            <div className="mt-1 h-4 w-full rounded bg-muted" />
            <div className="mt-0.5 h-4 w-2/3 rounded bg-muted" />
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-end gap-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-4 w-14 rounded bg-muted" />
            </div>
            <div className="h-8 w-full rounded-md bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
