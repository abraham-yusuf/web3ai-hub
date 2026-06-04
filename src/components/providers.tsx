"use client"

import { WagmiProviderWrapper } from "@/components/web3/wagmi-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiProviderWrapper>{children}</WagmiProviderWrapper>
}