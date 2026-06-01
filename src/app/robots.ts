import type { MetadataRoute } from "next"
import { env } from "@/lib/env"

const baseUrl = env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? "https://ai3.my.id"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Robots = MetadataRoute.Robots

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/_next",
          "/trpc",
          "/auth",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

export const dynamic = "force-static"