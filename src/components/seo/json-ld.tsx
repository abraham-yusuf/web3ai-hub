"use client"

/**
 * Client-safe JSON-LD components and re-exports of server-safe utilities.
 * This file is marked "use client" because JsonLd uses React hooks.
 *
 * For server-safe utilities (builders, JsonLdScript), import from ./json-ld-data
 * or from this file (it re-exports them).
 */

import { useEffect, useRef } from "react"

// Re-export server-safe utilities
export {
  JsonLdScript,
  buildWebsiteJsonLd,
  buildArticleJsonLd,
  buildItemListJsonLd,
  buildFaqJsonLd,
  buildBreadcrumbJsonLd,
  buildGlossaryPageJsonLd,
  buildGlossaryTermJsonLd,
} from "./json-ld-data"

type JsonLdProps = {
  json: object
  id?: string
}

/**
 * Client component — injects JSON-LD into <head> via useEffect.
 * Use this when you need dynamic JSON-LD that updates with state.
 * For static JSON-LD in server components, use JsonLdScript from json-ld-data.tsx.
 */
export function JsonLd({ json, id }: JsonLdProps) {
  const ref = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (typeof document === "undefined") return

    if (!ref.current) {
      ref.current = document.createElement("script")
      ref.current.type = "application/ld+json"
      if (id) ref.current.id = id
      ref.current.dataset.schemaType = "json-ld"
      document.head.appendChild(ref.current)
    }

    ref.current.textContent = JSON.stringify(json)

    return () => {
      if (ref.current) {
        ref.current.textContent = ""
      }
    }
  }, [json, id])

  return null
}