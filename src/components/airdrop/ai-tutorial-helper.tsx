"use client"

import { useState, type MouseEvent } from "react"
import { WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

type AirdropAITutorialHelperProps = {
  contentFieldName?: string
}

function readFormValue(form: HTMLFormElement, name: string) {
  const value = new FormData(form).get(name)
  return typeof value === "string" ? value.trim() : ""
}

function setTextareaValue(form: HTMLFormElement, name: string, value: string) {
  const textarea = form.elements.namedItem(name)
  if (!(textarea instanceof HTMLTextAreaElement)) return

  textarea.value = value
  textarea.dispatchEvent(new Event("input", { bubbles: true }))
  textarea.focus()
}

export function AirdropAITutorialHelper({ contentFieldName = "content" }: AirdropAITutorialHelperProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateTutorial(event: MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form
    if (!form || isGenerating) return

    const name = readFormValue(form, "name") || "airdrop project"
    const network = readFormValue(form, "network") || "unknown network"
    const difficulty = readFormValue(form, "difficulty") || "MEDIUM"
    const estimatedReward = readFormValue(form, "estimatedReward") || "not announced"
    const requirements = readFormValue(form, "requirements") || "Belum ada requirement khusus."
    const steps = readFormValue(form, "steps") || "Susun langkah partisipasi dari informasi project."

    setIsGenerating(true)
    setError(null)
    setTextareaValue(form, contentFieldName, "")

    try {
      const response = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic: [
            `Buat tutorial airdrop untuk ${name} di network ${network}.`,
            `Difficulty: ${difficulty}. Estimasi reward: ${estimatedReward}.`,
            `Requirements:\n${requirements}`,
            `Draft steps:\n${steps}`,
            "Sertakan checklist keamanan, langkah pengerjaan, troubleshooting, dan disclaimer risiko.",
          ].join("\n\n"),
          language: "id-ID",
          tone: "educational",
          length: "medium",
          template: "airdrop-guide",
          provider: "openai",
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error("AI helper gagal membuat tutorial. Pastikan provider AI aktif dan API key tersedia.")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let generated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        generated += decoder.decode(value, { stream: true })
        setTextareaValue(form, contentFieldName, generated)
      }

      generated += decoder.decode()
      setTextareaValue(form, contentFieldName, generated)
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "AI helper gagal membuat tutorial.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">AI Tutorial Helper</p>
          <p className="text-xs text-muted-foreground">
            Generate draft panduan airdrop dari nama project, network, requirements, dan steps di form ini.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={generateTutorial} disabled={isGenerating}>
          <WandSparkles className="mr-1 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Guide"}
        </Button>
      </div>
      {error ? <p className="mt-3 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
