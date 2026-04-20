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

interface LearnPage {
  title: string
  slug: string
  order: number
}

interface LearnTrack {
  title: string
  slug: string
  pages: LearnPage[]
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

  return files
    .reduce((allPosts: PostMetadata[], file: string) => {
      if (!file.endsWith(".mdx")) return allPosts

      const relativePath = file.replace(/\\/g, "/")
      const source = fs.readFileSync(path.join(dirPath, file), "utf8")
      const { data } = matter(source)

      return [
        {
          ...data,
          slug: relativePath.replace(".mdx", ""),
        } as PostMetadata,
        ...allPosts,
      ]
    }, [])
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

export function getLearnStructure(): LearnTrack[] {
  const learnPath = path.join(CONTENT_PATH, "learn")
  if (!fs.existsSync(learnPath)) return []

  const tracks = fs.readdirSync(learnPath)

  return tracks.flatMap((trackSlug) => {
    const trackPath = path.join(learnPath, trackSlug)
    if (!fs.statSync(trackPath).isDirectory()) return []

    const pages = fs
      .readdirSync(trackPath)
      .filter((file) => file.endsWith(".mdx"))
      .map((file): LearnPage => {
        const source = fs.readFileSync(path.join(trackPath, file), "utf8")
        const { data } = matter(source)

        return {
          title: String(data.title ?? file),
          slug: `learn/${trackSlug}/${file.replace(".mdx", "")}`,
          order: typeof data.order === "number" ? data.order : 0,
        }
      })
      .sort((a, b) => a.order - b.order)

    return [
      {
        title: trackSlug
          .split("-")
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(" "),
        slug: trackSlug,
        pages,
      },
    ]
  })
}
