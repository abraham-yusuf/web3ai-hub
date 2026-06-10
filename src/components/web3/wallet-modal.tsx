"use client"

import { useConnect } from "wagmi"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface WalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Simple wallet logos as inline SVGs
const WalletLogo = ({ name }: { name: string }) => {
  if (name === "MetaMask") {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path
          fill="#E17726"
          d="M37.6 3.5L22.6 15.5l2.6-6.3z"
        />
        <path fill="#E27625" d="M2.4 3.5l15 12-2.6-6.3z" />
        <path fill="#E27625" d="M33.2 27.9l-3.6 5.5 7.7 2.1 2.2-7.2z" />
        <path fill="#E27625" d="M0.5 28.3l2.2 7.2 7.7-2.1-3.6-5.5z" />
        <path fill="#E27625" d="M9.3 17.3l-2.3 3.5 8 1.8z" />
        <path fill="#E27625" d="M33 17.3l-5.7 5.3 8-1.8z" />
        <path fill="#D5BFB2" d="M9.4 33.4l5-2.5-4.3-3.3z" />
        <path fill="#233447" d="M25.6 30.9l5 2.5-.7-5.8z" />
        <path fill="#CC6228" d="M30.6 33.4l-5-2.5.3 3.8v1.9z" />
        <path fill="#E27525" d="M9.4 33.4l.4 2.1.3-3.9-5 2.5z" />
        <path fill="#E27525" d="M14.8 23.4l-4.9 2 2.5-3.6z" />
        <path fill="#E27525" d="M30.1 23.4l2.4-1.6-4.9-2z" />
        <path fill="#F5841F" d="M12.4 21.8l2.4 1.6-.3-2.2z" />
        <path fill="#C0AC9D" d="M33.1 19.7l-5.9 7.2 6.5-1.1z" />
        <path fill="#161616" d="M7 26.9l4.4-3.1-4.9 1.9z" />
        <path fill="#763E1A" d="M37.6 21.8l-7 2.9 6.4 1.5z" />
        <path fill="#F5841F" d="M27.6 21.8l.5 1.6 2.8-3.4z" />
        <path fill="#F5841F" d="M9.9 21.8l3.3 1.8-.5-1.6z" />
        <path fill="#E27525" d="M12.4 21.8l-.5-1.6-2.4 3.4z" />
        <path fill="#E27525" d="M35.1 19.7l-7.5 2.1 7-5.9z" />
        <path fill="#E27525" d="M12.5 15.9l5.5 1.4-2.8-4.6z" />
        <path fill="#F5841F" d="M20.2 6.6l1.4 4.2 1.4-4.2z" />
        <path fill="#F5841F" d="M22.6 9.2l-2.4-2.6-4.4 6.8z" />
        <path fill="#E27625" d="M37.6 3.5l-9.5 12.4 5.9-7.2z" />
        <path fill="#E27625" d="M12.5 15.9l2.5-6.3-6.8 7.9z" />
        <path fill="#E27625" d="M2.4 3.5l9.5 12.4-4.4-10.5z" />
        <path fill="#E27525" d="M22.6 15.5l-2.4 6.3 2.4 1.6 2.4-1.6z" />
        <path fill="#E27525" d="M15.1 21.8l-2.6 1.6 2.4-1.6z" />
        <path fill="#D5BFB2" d="M33 17.3l3.1 2.4-4.6-1.3z" />
        <path fill="#C0AC9D" d="M6.9 26.9l-2.4-5.2 2.4-4.3z" />
        <path fill="#C0AC9D" d="M12.5 15.9l.6 5.9 1.3-2.8z" />
        <path fill="#E27525" d="M27.6 21.8l2.6 1.6-2.6-1.6z" />
        <path fill="#E27525" d="M25.2 21.8l-2.6 3.3 5.5-.9z" />
        <path fill="#E27525" d="M12.5 15.9l-5.6 7.2 5.7-3.2z" />
        <path fill="#F5841F" d="M37.6 21.8l-7.1-4.3 2.6 4.9z" />
        <path fill="#E27525" d="M33.1 19.7l-5.5 7.2 7.1-4.3z" />
      </svg>
    )
  }
  if (name === "WalletConnect") {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path
          fill="#3B99FC"
          d="M12.1 14.9c5.3-5.2 14-5.2 19.3 0l.7.7c.2.2.2.6 0 .8l-2.1 2.1c-.1.1-.3.1-.4 0l-.9-.9c-3.9-3.8-10.3-3.8-14.2 0l-1.1 1.1c-.1.1-.3.1-.4 0l-2.1-2.1c-.2-.2-.2-.6 0-.8l.7-.7zm16.5 5.3l2.4 2.4c.2.2.2.6 0 .8l-6.6 6.6c-.3.3-.7.3-1 0l-4.7-4.7c-.1-.1-.3-.1-.4 0l-4.7 4.7c-.3.3-.7.3-1 0L6 23.4c-.2-.2-.2-.6 0-.8l2.4-2.4c.1-.1.3-.1.4 0l4.7 4.7c.1.1.3.1.4 0l4.7-4.7c.1-.1.3-.1.4 0l4.7 4.7c.1.1.3.1.4 0l4.7-4.7c.1-.1.3-.1.4 0z"
        />
      </svg>
    )
  }
  if (name === "Coinbase Wallet") {
    return (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <rect fill="#0052FF" width="40" height="40" rx="8" />
        <path
          fill="white"
          d="M20 8c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 20c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm6-9.5c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm-9 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm6.5 3.5h4v1h-4v-1z"
        />
      </svg>
    )
  }
  return null
}

export function WalletModal({ open, onOpenChange }: WalletModalProps) {
  const { connectors, connect, isPending, variables } = useConnect()

  const walletOptions = [
    { name: "MetaMask", connector: connectors.find((c) => c.name === "MetaMask") },
    { name: "WalletConnect", connector: connectors.find((c) => c.name === "WalletConnect") },
    { name: "Coinbase Wallet", connector: connectors.find((c) => c.name === "Coinbase Wallet") },
  ].filter((w) => w.connector)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to this platform
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => connect({ connector: wallet.connector as any })}
              disabled={isPending}
              className="flex w-full items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted"
            >
              <WalletLogo name={wallet.name} />
              <span className="flex-1 text-left font-medium">{wallet.name}</span>
              {isPending && variables?.connector === wallet.connector && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </button>
          ))}
          {walletOptions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No wallets detected. Please install a wallet extension.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}