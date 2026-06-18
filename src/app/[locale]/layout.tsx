import { PublicShell } from "@/components/layout/public-shell"

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PublicShell>{children}</PublicShell>
}
