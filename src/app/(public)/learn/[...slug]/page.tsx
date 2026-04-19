import { getFileBySlug } from "@/lib/mdx"
import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import { components } from "@/components/mdx"

interface LearnPageProps {
  params: Promise<{
    slug: string[]
  }>
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug } = await params
  
  // Join the slug array to match the filesystem path (e.g. ['web3-basics', 'blockchain-intro'])
  const slugPath = slug.join("/")
  
  const page = getFileBySlug("learn", slugPath)

  if (!page) {
    notFound()
  }

  return (
    <article className="py-6">
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <MDXRemote source={page.content} components={components} />
      </div>
    </article>
  )
}
