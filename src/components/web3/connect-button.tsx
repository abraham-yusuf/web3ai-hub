"use client"

import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi"
import { Button } from "@/components/ui/button"
import { WalletModal } from "./wallet-modal"
import { useState } from "react"
import { Loader2, LogOut, Wallet } from "lucide-react"

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance } = useBalance({ address })
  const [showModal, setShowModal] = useState(false)

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatBalance = () => {
    if (!balance) return null
    const formatted = Number(balance.value) / Math.pow(10, balance.decimals)
    return `${formatted.toFixed(4)} ${balance.symbol}`
  }

  if (isConnecting) {
    return (
      <Button variant="outline" disabled size="sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="font-mono">
          <Wallet className="mr-2 h-4 w-4" />
          {truncateAddress(address)}
          {balance && (
            <span className="ml-2 text-muted-foreground">
              {formatBalance()}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => disconnect()}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)}>
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
      <WalletModal open={showModal} onOpenChange={setShowModal} />
    </>
  )
}