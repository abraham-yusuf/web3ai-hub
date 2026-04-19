import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: string
  language?: string
}

export async function CodeBlock({ children, language = 'text' }: CodeBlockProps) {
  const html = await codeToHtml(children, {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div
      className="my-6 overflow-hidden rounded-lg border bg-zinc-950"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
