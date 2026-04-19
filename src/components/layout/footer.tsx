import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <Link href="/" className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Web3AI Hub
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Platform all-in-one untuk belajar Web3 dan AI. Temukan tutorial, airdrop, dan tools AI terbaru.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link href="/learn" className="hover:text-primary">Learn</Link></li>
              <li><Link href="/airdrop" className="hover:text-primary">Airdrops</Link></li>
              <li><Link href="/ai-tools" className="hover:text-primary">AI Tools</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Twitter / X</Link></li>
              <li><Link href="#" className="hover:text-primary">Telegram</Link></li>
              <li><Link href="#" className="hover:text-primary">Discord</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Web3AI Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
