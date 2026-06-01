// Simple event bus for cross-component communication on learn pages
type ExplainEvent = {
  selection: string
  title: string
  content: string
}

export function emitExplainEvent(data: ExplainEvent) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("learn:explain-text", { detail: data }))
  }
}

export function onExplainEvent(handler: (data: ExplainEvent) => void) {
  if (typeof window !== "undefined") {
    const listener = (e: Event) => handler((e as CustomEvent<ExplainEvent>).detail)
    window.addEventListener("learn:explain-text", listener)
    return () => window.removeEventListener("learn:explain-text", listener)
  }
  return () => {}
}