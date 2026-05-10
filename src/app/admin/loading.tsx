function SkeletonRow() {
  return (
    <tr className="border-t">
      <td className="px-4 py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-5 w-20 animate-pulse rounded-full bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
      <td className="px-4 py-3"><div className="h-8 w-28 animate-pulse rounded bg-muted" /></td>
    </tr>
  )
}

export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-20 animate-pulse rounded-xl border bg-muted/60" />
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <tbody>{Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)}</tbody>
        </table>
      </div>
    </div>
  )
}
