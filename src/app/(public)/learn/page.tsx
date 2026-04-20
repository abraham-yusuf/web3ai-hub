import { getLearnStructure } from "@/lib/mdx"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Book } from "lucide-react"

export default function LearnIndexPage() {
  const structure = getLearnStructure()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Materi Pembelajaran</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Pilih jalur pembelajaran untuk mulai menguasai teknologi Web3 dan AI.
        </p>
      </div>

      <div className="grid gap-6">
        {structure.map((track) => (
          <Card key={track.slug}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Book className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{track.title}</CardTitle>
                <CardDescription>{track.pages.length} Materi</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-2">
                {track.pages.map((page) => (
                  <Link 
                    key={page.slug} 
                    href={`/${page.slug}`}
                    className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-muted transition-colors group"
                  >
                    <span className="text-muted-foreground group-hover:text-primary">{page.order}.</span>
                    <span className="flex-1">{page.title}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
