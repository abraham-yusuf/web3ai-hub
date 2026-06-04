"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ImportFaqDialog() {
  const [showDialog, setShowDialog] = useState(false)
  const [topic, setTopic] = useState("")
  const [category, setCategory] = useState("")
  const [count, setCount] = useState(5)
  const [language, setLanguage] = useState("id")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openDialog() {
    setShowDialog(true)
    setResult(null)
    setError(null)
    setTopic("")
    setCategory("")
    setCount(5)
  }

  function closeDialog() {
    setShowDialog(false)
    setResult(null)
    setError(null)
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/research/faq", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topic,
          category,
          count,
          language: language === "id" ? "Indonesian" : "English",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Gagal import")
      setResult(`${data.saved} FAQ berhasil disimpan.`)
      setTopic("")
      setCategory("")
      setCount(5)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex h-9 items-center rounded-md border border-green-600 px-4 text-sm font-medium text-green-700 hover:bg-green-50"
      >
        📥 Import from AI
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">📥 Import FAQ dari AI</h2>
              <button
                type="button"
                onClick={closeDialog}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {result ? (
              <div className="space-y-4">
                <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
                  ✅ {result}
                </div>
                <div className="flex gap-2">
                  <Button onClick={closeDialog} className="flex-1">
                    Tutup
                  </Button>
                  <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                    Import Lagi
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium">Topik FAQ</label>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Contoh: DeFi, NFT, Smart Contract..."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Kategori (opsional)</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Contoh: web3, billing, general..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Jumlah FAQ</label>
                  <div className="flex gap-1">
                    {[3, 5, 8, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCount(n)}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          count === n ? "border-primary bg-primary/10" : ""
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium">Bahasa</label>
                  <div className="flex gap-1">
                    {[
                      { value: "id", label: "🇮🇩 Indonesia" },
                      { value: "en", label: "🇬🇧 English" },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setLanguage(lang.value)}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          language === lang.value ? "border-primary bg-primary/10" : ""
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog} className="flex-1">
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "⏳ Generating..." : "🚀 Generate & Simpan"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}