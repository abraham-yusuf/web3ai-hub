import { createConfig, http } from "wagmi"
import { mainnet, arbitrum, optimism, base, polygon } from "wagmi/chains"
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo"

export const config = createConfig({
  chains: [mainnet, arbitrum, optimism, base, polygon],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "AI3" }),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [polygon.id]: http(),
  },
})

declare module "wagmi" {
  interface Register {
    config: typeof config
  }
}