import { getFileBySlug } from "@/lib/mdx"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { components } from "@/components/mdx"

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getFileBySlug("blog", slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-3xl mx-auto py-10">
      <div className="mb-8">
        <div className="text-sm font-medium text-primary mb-2">
          {post.frontMatter.category}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          {post.frontMatter.title}
        </h1>
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span>{post.frontMatter.date}</span>
          <span>•</span>
          <span>By {post.frontMatter.author}</span>
        </div>
      </div>
      
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <MDXRemote source={post.content} components={components} />
      </div>
    </article>
  )
}
