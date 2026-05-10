import assert from "node:assert/strict"
import test from "node:test"
import { createWriterPrompt } from "../src/lib/ai/prompts"

test("createWriterPrompt includes airdrop guide requirements and safety disclaimer instruction", () => {
  const prompt = createWriterPrompt({
    topic: "LayerZero airdrop checklist",
    language: "id-ID",
    tone: "educational",
    length: "medium",
    template: "airdrop-guide",
    provider: "openai",
  })

  assert.match(prompt, /LayerZero airdrop checklist/)
  assert.match(prompt, /Panduan klaim airdrop/)
  assert.match(prompt, /disclaimer risiko/)
  assert.match(prompt, /Markdown/)
})
