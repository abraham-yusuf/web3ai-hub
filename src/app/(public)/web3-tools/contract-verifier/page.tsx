"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type ChainConfig = {
  name: string
  apiUrl: string
  explorerUrl: string
}

const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    name: "Ethereum",
    apiUrl: "https://api.etherscan.io/api",
    explorerUrl: "https://etherscan.io/address",
  },
  polygon: {
    name: "Polygon",
    apiUrl: "https://api.polygonscan.com/api",
    explorerUrl: "https://polygonscan.com/address",
  },
  bsc: {
    name: "BSC",
    apiUrl: "https://api.bscscan.com/api",
    explorerUrl: "https://bscscan.com/address",
  },
  arbitrum: {
    name: "Arbitrum",
    apiUrl: "https://api.arbiscan.io/api",
    explorerUrl: "https://arbiscan.io/address",
  },
}

type ContractInfo = {
  isVerified: boolean
  contractName: string
  compilerVersion: string
  sourceCode: string
  optimization: string
  licenseType: string
}

export default function ContractVerifierPage() {
  const [address, setAddress] = useState("")
  const [chain, setChain] = useState("ethereum")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState<ContractInfo | null>(null)

  async function fetchContract() {
    if (!address.match(/^0x[0-9a-fA-F]{40}$/)) {
      setError("Invalid address. Must start with 0x followed by 40 hex characters.")
      return
    }
    setLoading(true)
    setError("")
    setInfo(null)
    try {
      const cfg = CHAINS[chain]
      const url = `${cfg.apiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=YourApiKeyToken`
      const res = await fetch(url)
      const json = await res.json()
      if (json.status === "1" && json.result?.[0]) {
        const r = json.result[0]
        setInfo({
          isVerified: r.SourceCode !== "",
          contractName: r.ContractName || "Unknown",
          compilerVersion: r.CompilerVersion || "Unknown",
          sourceCode: r.SourceCode || "",
          optimization: r.OptimizationUsed === "1" ? "Yes" : "No",
          licenseType: r.LicenseType || "Unknown",
        })
      } else {
        setError(json.result || "Failed to fetch contract info.")
      }
    } catch {
      setError("Network error. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const explorerUrl = info && address ? `${CHAINS[chain].explorerUrl}/${address}#code` : null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <span>🔍</span> Contract Verifier
        </h1>
        <p className="mt-2 text-muted-foreground">
          Check if a smart contract is verified and view its source code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Address</CardTitle>
          <CardDescription>Enter a contract address and select the chain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {Object.entries(CHAINS).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
            <Input
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchContract()}
              className="font-mono text-sm flex-1"
            />
            <Button onClick={fetchContract} disabled={loading || !address}>
              {loading ? "Checking…" : "Verify"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {info && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${info.isVerified ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                  {info.isVerified ? "✓ Verified" : "✗ Not Verified"}
                </span>
                <span className="text-sm text-muted-foreground">{CHAINS[chain].name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Contract Name", value: info.contractName },
                  { label: "Compiler Version", value: info.compilerVersion },
                  { label: "Optimization", value: info.optimization },
                  { label: "License", value: info.licenseType },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium mt-0.5 break-all">{value}</p>
                  </div>
                ))}
              </div>

              {info.isVerified && info.sourceCode && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Source Code Preview (first 300 chars)</p>
                  <pre className="rounded-lg border bg-muted/50 p-3 text-xs overflow-auto max-h-40 whitespace-pre-wrap break-all">
                    {info.sourceCode.slice(0, 300)}{info.sourceCode.length > 300 ? "…" : ""}
                  </pre>
                </div>
              )}

              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View full source on {CHAINS[chain].name} Explorer →
                </a>
              )}
            </div>
          )}

          {!info && !error && !loading && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Enter a contract address to check verification status.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        ℹ️ Data from Etherscan-compatible APIs. Only publicly verified contracts will show source code.
      </div>
    </div>
  )
}
