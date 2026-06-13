"use client"

import { SessionProvider } from "next-auth/react"
import { WagmiProviderWrapper } from "@/components/web3/wagmi-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiProviderWrapper>{children}</WagmiProviderWrapper>
    </SessionProvider>
  )
}
