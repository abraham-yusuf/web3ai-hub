import { saveAISettingsAction } from "@/app/admin/settings/actions"
import { env } from "@/lib/env"
import { getAISettings } from "@/lib/ai/settings"
import { AI_PROVIDERS } from "@/lib/ai/types"

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  const settings = await getAISettings()
  const encryptionReady = Boolean(env.AI_SETTINGS_ENCRYPTION_KEY)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Settings</h1>
        <p className="text-muted-foreground">Konfigurasi provider, model, temperature, dan API key terenkripsi.</p>
      </div>

      {!encryptionReady && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
          AI_SETTINGS_ENCRYPTION_KEY belum diisi. Simpan API key baru akan gagal hingga env ini tersedia.
        </div>
      )}

      <form action={saveAISettingsAction} className="space-y-4">
        {AI_PROVIDERS.map((provider) => (
          <section key={provider} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize">{provider}</h2>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" name={`${provider}_enabled`} defaultChecked={settings[provider].enabled} />
                Enabled
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Model</span>
                <input
                  name={`${provider}_model`}
                  defaultValue={settings[provider].model}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Temperature (0 - 1)</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  name={`${provider}_temperature`}
                  defaultValue={settings[provider].temperature}
                  className="w-full rounded-md border bg-background px-3 py-2"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm">
              <span className="font-medium">API Key (kosongkan jika tidak diubah)</span>
              <input
                type="password"
                name={`${provider}_api_key`}
                className="w-full rounded-md border bg-background px-3 py-2"
                placeholder={settings[provider].encryptedApiKey ? "•••••••• (tersimpan)" : "Masukkan API key"}
              />
            </label>
          </section>
        ))}

        <button type="submit" className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Simpan AI Settings
        </button>
      </form>
    </div>
  )
}
