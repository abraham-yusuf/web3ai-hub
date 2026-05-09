import type { ReactNode } from 'react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: ReactNode
  language?: string
}

function toCodeString(children: ReactNode): { code: string; hadNonString: boolean } {
  if (typeof children === 'string') return { code: children, hadNonString: false }
  if (typeof children === 'number' || typeof children === 'boolean') {
    return { code: String(children), hadNonString: true }
  }
  if (Array.isArray(children)) {
    let hadNonString = false
    const code = children
      .map((child) => {
        if (typeof child === 'string') return child
        if (typeof child === 'number' || typeof child === 'boolean') {
          hadNonString = true
          return String(child)
        }
        if (child != null) hadNonString = true
        return ''
      })
      .join('')
    return { code, hadNonString }
  }
  if (children == null) return { code: '', hadNonString: false }
  return { code: '', hadNonString: true }
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
  const { code, hadNonString } = toCodeString(children)
  const lang = normalizeLanguage(language)

  if (hadNonString) {
    console.warn('[CodeBlock] Non-string children were ignored while rendering code.')
  }

  try {
    const html = await codeToHtml(code, {
      lang,
      theme: 'github-dark',
    })
    return renderHighlighted(html)
  } catch (error) {
    console.error(
      `[CodeBlock] Failed to highlight ${code.length} chars with language "${lang}". Language may not be supported by Shiki.`,
      error
    )
  }

  try {
    const html = await codeToHtml(code, {
      lang: 'text',
      theme: 'github-dark',
    })
    return renderHighlighted(html)
  } catch (error) {
    console.error(
      `[CodeBlock] Critical: primary and fallback highlighting failed for ${code.length} chars. Rendering as plain text.`,
      error
    )
  }

  return (
    <pre className="my-6 overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-100">
      <code>{code}</code>
    </pre>
  )
}
