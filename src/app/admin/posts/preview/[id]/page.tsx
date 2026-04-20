import { components } from "@/components/mdx"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PreviewPostPageProps {
  params: Promise<{ id: string }>
}

export default async function PreviewPostPage({ params }: PreviewPostPageProps) {
  const { id } = await params

  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="space-y-3">
        <Badge variant="secondary">Preview Mode</Badge>
        <h1 className="text-4xl font-bold">{post.title}</h1>
        <p className="text-muted-foreground">/{post.slug}</p>
        <Link href={`/admin/posts/${post.id}/edit`} className="text-sm text-primary hover:underline">
          ← Back to editor
        </Link>
      </div>

      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  )
}
