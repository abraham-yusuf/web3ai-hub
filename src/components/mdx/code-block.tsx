import type { ReactNode } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: ReactNode
  language?: string
}

function toCodeString(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) {
    return children.map((child) => (typeof child === 'string' ? child : '')).join('')
  }
  if (children == null) return ''
  return String(children)
}

function normalizeLanguage(language?: string): string {
  if (!language) return 'text'
  const trimmed = language.trim()
  return trimmed.length > 0 ? trimmed : 'text'
}

function renderHighlighted(html: string) {
  return (
    <div
      className="my-6 overflow-hidden rounded-lg border bg-zinc-950"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export async function CodeBlock({ children, language }: CodeBlockProps) {
  const code = toCodeString(children)
  const lang = normalizeLanguage(language)

  try {
    const html = await codeToHtml(code, {
      lang,
      theme: 'github-dark',
    })
    return renderHighlighted(html)
  } catch (error) {
    console.error(`[CodeBlock] Failed to highlight language "${lang}".`, error)
  }

  try {
    const html = await codeToHtml(code, {
      lang: 'text',
      theme: 'github-dark',
    })
    return renderHighlighted(html)
  } catch (error) {
    console.error('[CodeBlock] Failed to highlight with fallback.', error)
  }

  return (
    <pre className="my-6 overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-100">
      <code>{code}</code>
    </pre>
  )
}
