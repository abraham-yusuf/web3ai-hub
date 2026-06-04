"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Loader2 } from "lucide-react"

interface RiskFactors {
  noOfficialChannel?: boolean
  promiseGuarantee?: boolean
  suspiciousUrl?: boolean
  fakeAirdrop?: boolean
  requiresDeposit?: boolean
  anonymousTeam?: boolean
  unrealisticPromises?: boolean
  copiedContent?: boolean
  reasons?: string[]
}

interface RiskScoreData {
  score: number
  level: "LOW" | "MEDIUM" | "HIGH" | "SCAM"
  factors: RiskFactors
  analyzedAt: string
}

interface RiskAnalysisPanelProps {
  airdropId: string
  initialRiskLevel?: string | null
  existingScore?: RiskScoreData | null
}

const levelConfig = {
  LOW: {
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: ShieldCheck,
    label: "Low Risk",
  },
  MEDIUM: {
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    icon: Shield,
    label: "Medium Risk",
  },
  HIGH: {
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: ShieldAlert,
    label: "High Risk",
  },
  SCAM: {
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertTriangle,
    label: "Potential Scam",
  },
}

export function RiskAnalysisPanel({
  airdropId,
  initialRiskLevel,
  existingScore,
}: RiskAnalysisPanelProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [riskData, setRiskData] = useState<RiskScoreData | null>(
    existingScore as RiskScoreData | null
  )
  const [error, setError] = useState<string | null>(null)

  const currentLevel = (riskData?.level ||
    (initialRiskLevel as "LOW" | "MEDIUM" | "HIGH" | "SCAM")) ||
    null

  async function runAnalysis() {
    setAnalyzing(true)
    setError(null)

    try {
      const res = await fetch(`/api/airdrop/${airdropId}/risk-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ airdropId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Analysis failed")
      }

      const data = await res.json()
      setRiskData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🔍 Risk Analysis</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={runAnalysis}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "🔍 Analisis Risiko"
          )}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {currentLevel && (
        <div className="space-y-3">
          {(() => {
            const config = levelConfig[currentLevel]
            const Icon = config.icon
            return (
              <div className={`flex items-center gap-2 rounded-lg border p-3 ${config.color}`}>
                <Icon className="h-5 w-5" />
                <div>
                  <p className="font-medium">{config.label}</p>
                  {riskData && (
                    <p className="text-xs opacity-80">
                      Score: {riskData.score}/100
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {!currentLevel && !analyzing && !error && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          <ShieldQuestion className="h-4 w-4" />
          <span>Click &quot;Analisis Risiko&quot; to analyze this airdrop</span>
        </div>
      )}

      {riskData?.factors && Object.keys(riskData.factors).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Red Flags:</p>
          <ul className="space-y-1">
            {riskData.factors.reasons?.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive">⚠️</span>
                <span>{reason}</span>
              </li>
            ))}
            {riskData.factors.noOfficialChannel && (
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive">⚠️</span>
                <span>No official social media channels</span>
              </li>
            )}
            {riskData.factors.requiresDeposit && (
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive">⚠️</span>
                <span>Requires depositing funds</span>
              </li>
            )}
            {riskData.factors.promiseGuarantee && (
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-destructive">⚠️</span>
                <span>Promises guaranteed returns</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}