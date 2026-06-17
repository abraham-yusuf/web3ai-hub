import { auth } from "@/auth"
import { CopyLinkButton } from "@/components/referral/copy-link-button"
import { redirect } from "next/navigation"
import Link from "next/link"

async function getReferralData(userId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai3.web.id"
    const res = await fetch(`${baseUrl}/api/gamification/referral`, {
      headers: { Cookie: `` }, // session propagated via auth()
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function ReferralPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md bg-card rounded-2xl border shadow-sm p-8 text-center">
          <span className="text-5xl">🎁</span>
          <h1 className="mt-4 text-2xl font-bold">Program Referral AI3 Hub</h1>
          <p className="mt-2 text-muted-foreground">
            Login untuk mendapatkan kode referral unikmu dan mulai mengundang teman!
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ai3.web.id"
  const userId = session.user.id

  // Construct referral code from userId (first 8 chars)
  const referralCode = userId.replace(/-/g, "").slice(0, 8).toUpperCase()
  const inviteLink = `${appUrl}/register?ref=${referralCode}`

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-5xl">🎁</span>
          <h1 className="mt-4 text-3xl font-bold">Program Referral</h1>
          <p className="mt-2 text-muted-foreground">
            Undang teman ke AI3 Hub. Kalian berdua dapat <strong>50 XP</strong> gratis!
          </p>
        </div>

        {/* Referral Code Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Kode Referral Kamu</h2>
          <div className="flex items-center justify-between gap-4 bg-muted/50 rounded-xl px-4 py-3">
            <span className="font-mono text-2xl font-bold tracking-widest text-violet-600">
              {referralCode}
            </span>
            <CopyLinkButton text={referralCode} label="Salin Kode" />
          </div>
        </div>

        {/* Invite Link Card */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Link Undangan</h2>
          <div className="flex items-center gap-3">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm font-mono truncate border border-border focus:outline-none"
            />
            <CopyLinkButton text={inviteLink} label="Salin Link" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Share link ini ke teman. Mereka daftar → kamu dapat 50 XP, mereka juga dapat 50 XP!
          </p>
        </div>

        {/* How it works */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Cara Kerjanya</h2>
          <div className="flex flex-col gap-4">
            {[
              { icon: "🔗", step: "1", title: "Salin link undanganmu", desc: "Copy link di atas dan share ke teman-temanmu" },
              { icon: "👥", step: "2", title: "Temanmu daftar", desc: "Teman kamu buka link dan buat akun di AI3 Hub" },
              { icon: "⭐", step: "3", title: "Kalian berdua dapat XP!", desc: "Kamu +50 XP, temanmu juga +50 XP langsung" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0 text-lg">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
