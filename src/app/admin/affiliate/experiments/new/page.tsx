import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { createExperimentAction } from "../../actions"

export default function NewExperimentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/affiliate" className="text-muted-foreground hover:text-foreground text-sm">
          ← Affiliate
        </Link>
        <h1 className="text-2xl font-bold">New A/B Experiment</h1>
      </div>

      <form action={createExperimentAction} className="space-y-6 rounded-xl border p-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Experiment Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. CTA Button Color Test" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPage">Target Page</Label>
              <select
                id="targetPage"
                name="targetPage"
                className="w-full rounded-md border bg-background p-2 text-sm"
              >
                <option value="">All pages</option>
                <option value="detail">Tool Detail Page</option>
                <option value="grid">Tools Grid</option>
                <option value="compare">Compare Page</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={2}
              placeholder="What are we testing and why?"
              className="w-full rounded-md border bg-background p-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metric">Primary Metric</Label>
            <select
              id="metric"
              name="metric"
              className="w-full rounded-md border bg-background p-2 text-sm md:w-64"
            >
              <option value="ctr">Click-through Rate (CTR)</option>
              <option value="conversion_rate">Conversion Rate</option>
              <option value="revenue_per_click">Revenue per Click</option>
            </select>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Variants</h2>
          <p className="text-sm text-muted-foreground">
            Define at least 2 variants. Weights should sum to 100%.
          </p>

          {/* Control */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-medium text-sm">🔵 Control (A)</h3>
            <input type="hidden" name="variant_0_id" value="control" />
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input name="variant_0_label" defaultValue="Control" placeholder="Control" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weight %</Label>
                <Input name="variant_0_weight" type="number" defaultValue="50" min="1" max="99" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA Text</Label>
                <Input name="variant_0_ctaText" placeholder="e.g. Try Free" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA Color</Label>
                <Input name="variant_0_ctaColor" placeholder="e.g. blue, green" />
              </div>
            </div>
          </div>

          {/* Treatment A */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-medium text-sm">🟢 Treatment (B)</h3>
            <input type="hidden" name="variant_1_id" value="treatment_b" />
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input name="variant_1_label" defaultValue="Treatment B" placeholder="Treatment B" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Weight %</Label>
                <Input name="variant_1_weight" type="number" defaultValue="50" min="1" max="99" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA Text</Label>
                <Input name="variant_1_ctaText" placeholder="e.g. Start Free Trial" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CTA Color</Label>
                <Input name="variant_1_ctaColor" placeholder="e.g. green, orange" />
              </div>
            </div>
          </div>

          {/* Treatment B (optional) */}
          <details className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium text-sm text-muted-foreground">
              + Add Treatment C (optional)
            </summary>
            <div className="mt-3 space-y-3">
              <input type="hidden" name="variant_2_id" value="treatment_c" />
              <div className="grid gap-3 md:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input name="variant_2_label" placeholder="Treatment C" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Weight %</Label>
                  <Input name="variant_2_weight" type="number" placeholder="33" min="1" max="99" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CTA Text</Label>
                  <Input name="variant_2_ctaText" placeholder="e.g. Get Started" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CTA Color</Label>
                  <Input name="variant_2_ctaColor" placeholder="e.g. purple" />
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Create Experiment</Button>
          <Link href="/admin/affiliate">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
