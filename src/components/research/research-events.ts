/**
 * Research event bus — communicates selection/input from ResearchHub
 * components to the ResearchSidebar panel.
 */

type ResearchEventMap = {
  "research-input": { mode: string; value: string }
}

export function emitResearchEvent(mode: string, value: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent<ResearchEventMap["research-input"]>("research-input", {
      detail: { mode, value },
    }),
  )
}

export function onResearchEvent(
  callback: (mode: string, value: string) => void,
): () => void {
  if (typeof window === "undefined") return () => {}
  const handler = (e: Event) => {
    const custom = e as CustomEvent<ResearchEventMap["research-input"]>
    callback(custom.detail.mode, custom.detail.value)
  }
  window.addEventListener("research-input", handler)
  return () => window.removeEventListener("research-input", handler)
}