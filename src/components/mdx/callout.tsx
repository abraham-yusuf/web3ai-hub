import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

interface CalloutProps {
  children?: React.ReactNode
  type?: "default" | "warning" | "danger" | "success"
}

export function Callout({
  children,
  type = "default",
  ...props
}: CalloutProps) {
  const icons = {
    default: <Info className="h-5 w-5 text-blue-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    danger: <AlertCircle className="h-5 w-5 text-red-500" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  }

  const styles = {
    default: "border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/20",
    danger: "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20",
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20",
  }

  return (
    <div
      className={cn(
        "my-6 flex items-start gap-4 rounded-lg border p-4",
        styles[type]
      )}
      {...props}
    >
      <div className="mt-1">{icons[type]}</div>
      <div className="flex-1 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
