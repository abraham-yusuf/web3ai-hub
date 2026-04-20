import Script from "next/script"
import { auth } from "@/auth"
import { getAdSettings, type AdSection } from "@/lib/ads"
import { ClientAdSlot } from "@/components/ads/client-ad-slot"

type AdSlotProps = {
  section: AdSection
  label?: string
  className?: string
}

export async function AdSlot({ section, label = "Sponsored", className }: AdSlotProps) {
  const session = await auth()

  if (session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR") {
    return null
  }

  const settings = await getAdSettings()
  const sectionConfig = settings.sections[section]

  if (!settings.globallyEnabled || !settings.clientId || !sectionConfig.enabled || !sectionConfig.slotId) {
    return null
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <Script
        id={`adsense-script-${settings.clientId}`}
        async
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.clientId}`}
        crossOrigin="anonymous"
      />
      <ClientAdSlot clientId={settings.clientId} slotId={sectionConfig.slotId} />
    </div>
  )
}
