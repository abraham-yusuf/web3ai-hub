"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const INTERESTS = [
  { id: "web3", label: "⛓️ Web3", desc: "Blockchain, crypto, NFT" },
  { id: "ai", label: "🤖 AI Tools", desc: "LLMs, prompting, automation" },
  { id: "airdrops", label: "🪂 Airdrops", desc: "Free tokens, early access" },
  { id: "defi", label: "💰 DeFi", desc: "Yield, liquidity, trading" },
]

const STEP_LABELS = ["Selamat Datang", "Pilih Minat", "Mulai Belajar"]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  useEffect(() => {
    const completed = localStorage.getItem("onboarding_completed")
    if (completed) { router.replace("/"); return }
    const saved = localStorage.getItem("onboarding_progress")
    if (saved) {
      const progress = JSON.parse(saved)
      if (progress.name) setName(progress.name)
      if (progress.interests) setSelectedInterests(progress.interests)
      if (progress.step) setStep(progress.step)
    }
  }, [router])

  function saveProgress(data: object) {
    const prev = JSON.parse(localStorage.getItem("onboarding_progress") || "{}")
    localStorage.setItem("onboarding_progress", JSON.stringify({ ...prev, ...data }))
  }

  function toggleInterest(id: string) {
    setSelectedInterests((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  function handleSkip() {
    localStorage.setItem("onboarding_completed", "1")
    localStorage.removeItem("onboarding_progress")
    router.push("/")
  }

  function handleNext() {
    if (step === 1) { saveProgress({ name, step: 2 }); setStep(2) }
    else if (step === 2) { saveProgress({ interests: selectedInterests, step: 3 }); setStep(3) }
  }

  function handleFinish() {
    localStorage.setItem("onboarding_completed", "1")
    localStorage.removeItem("onboarding_progress")
    const target = selectedInterests.length > 0 ? `/learn?topics=${selectedInterests.join(",")}` : "/learn"
    router.push(target)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                i + 1 < step ? "bg-violet-600 border-violet-600 text-white"
                : i + 1 === step ? "border-violet-600 text-violet-600"
                : "border-muted-foreground/30 text-muted-foreground/30"
              }`}>
                {i + 1 < step ? "✓" : i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-violet-600" : "bg-muted-foreground/20"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-4xl">👋</span>
                <h1 className="mt-3 text-2xl font-bold">Selamat datang di AI3 Hub!</h1>
                <p className="mt-2 text-muted-foreground">Platform belajar AI & Web3 terlengkap. Yuk mulai dengan memperkenalkan dirimu.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="name">Nama panggilanmu</label>
                <Input id="name" placeholder="e.g. Budi" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && name && handleNext()} />
              </div>
              <div className="flex justify-between items-center">
                <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">Lewati</button>
                <Button onClick={handleNext} disabled={!name}>Lanjut →</Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-4xl">🎯</span>
                <h1 className="mt-3 text-2xl font-bold">Hai{name ? `, ${name}` : ""}! Apa yang ingin kamu pelajari?</h1>
                <p className="mt-2 text-muted-foreground">Pilih topik yang menarik bagimu. Bisa lebih dari satu.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <button key={interest.id} onClick={() => toggleInterest(interest.id)}
                    className={`flex flex-col gap-1 p-4 rounded-xl border-2 text-left transition-all ${
                      selectedInterests.includes(interest.id)
                        ? "border-violet-600 bg-violet-50 dark:bg-violet-950"
                        : "border-border hover:border-violet-300"
                    }`}>
                    <span className="text-lg">{interest.label}</span>
                    <span className="text-xs text-muted-foreground">{interest.desc}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">← Kembali</button>
                <Button onClick={handleNext}>{selectedInterests.length > 0 ? "Lanjut →" : "Lewati"}</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-6 text-center">
              <div>
                <span className="text-5xl">🚀</span>
                <h1 className="mt-4 text-2xl font-bold">Siap untuk memulai!</h1>
                <p className="mt-2 text-muted-foreground">
                  {name ? `${name}, kamu` : "Kamu"} sudah siap menjelajahi dunia AI & Web3
                  {selectedInterests.length > 0 ? " — dimulai dari topik yang kamu pilih." : "."}
                </p>
              </div>
              {selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedInterests.map((id) => {
                    const interest = INTERESTS.find((i) => i.id === id)
                    return interest ? (
                      <span key={id} className="px-3 py-1 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium">
                        {interest.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
              <Button size="lg" className="w-full" onClick={handleFinish}>Mulai Belajar! 🎓</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
