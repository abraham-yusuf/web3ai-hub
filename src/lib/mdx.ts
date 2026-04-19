import fs from "fs"
import path from "path"
import matter from "gray-matter"

const CONTENT_PATH = path.join(process.cwd(), "content")

export type ContentType = "blog" | "learn" | "airdrop"

export interface PostMetadata {
  title: string
  date?: string
  author?: string
  category?: string
  tags?: string[]
  excerpt?: string
  coverImage?: string
  published?: boolean
  featured?: boolean
  slug: string
  order?: number
}

export function getFileBySlug(type: ContentType, slug: string) {
  const filePath = path.join(CONTENT_PATH, type, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  
  const source = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(source)

  return {
    content,
    frontMatter: {
      slug,
      ...data,
    } as PostMetadata,
  }
}

export function getAllFilesMetadata(type: ContentType): PostMetadata[] {
  const dirPath = path.join(CONTENT_PATH, type)
  if (!fs.existsSync(dirPath)) return []

  const files = fs.readdirSync(dirPath, { recursive: true }) as string[]

  return files.reduce((allPosts: PostMetadata[], file: string) => {
    if (!file.endsWith(".mdx")) return allPosts

    const relativePath = file.replace(/\\/g, '/')
    const source = fs.readFileSync(path.join(dirPath, file), "utf8")
    const { data } = matter(source)

    return [
      {
        ...data,
        slug: relativePath.replace(".mdx", ""),
      } as PostMetadata,
      ...allPosts,
    ]
  }, []).sort((a, b) => (a.order || 0) - (b.order || 0))
}

export function getLearnStructure() {
  const learnPath = path.join(CONTENT_PATH, "learn")
  if (!fs.existsSync(learnPath)) return []

  const tracks = fs.readdirSync(learnPath)

  return tracks.map(trackSlug => {
    const trackPath = path.join(learnPath, trackSlug)
    if (!fs.statSync(trackPath).isDirectory()) return null

    const pages = fs.readdirSync(trackPath)
      .filter(f => f.endsWith(".mdx"))
      .map(file => {
        const source = fs.readFileSync(path.join(trackPath, file), "utf8")
        const { data } = matter(source)
        return {
          title: data.title as string,
          slug: `learn/${trackSlug}/${file.replace(".mdx", "")}`,
          order: (data.order as number) || 0
        }
      })
      .sort((a, b) => a.order - b.order)

    return {
      title: trackSlug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
      slug: trackSlug,
      pages
    }
  }).filter(Boolean)
}
