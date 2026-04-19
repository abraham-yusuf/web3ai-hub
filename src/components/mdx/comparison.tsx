import { Check, X } from "lucide-react"

interface ComparisonProps {
  items: {
    label: string
    pros: string[]
    cons: string[]
  }[]
}

export function Comparison({ items }: ComparisonProps) {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="border-b p-4 font-bold bg-muted/50 rounded-t-xl">{item.label}</div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-500 tracking-wider">Kelebihan</span>
              <ul className="space-y-1">
                {item.pros.map((pro, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-red-500 tracking-wider">Kekurangan</span>
              <ul className="space-y-1">
                {item.cons.map((con, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                    <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
