"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const resolveCallbackUrl = () => {
    const callbackUrlParam = searchParams.get("callbackUrl")
    if (!callbackUrlParam) return "/admin"
    if (!callbackUrlParam.startsWith("/") || callbackUrlParam.startsWith("//")) {
      return "/admin"
    }
    if (callbackUrlParam.includes("\\")) {
      return "/admin"
    }
    try {
      const parsedUrl = new URL(callbackUrlParam, "http://internal")
      if (!parsedUrl.pathname.startsWith("/admin")) return "/admin"
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
    } catch {
      return "/admin"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const callbackUrl = resolveCallbackUrl()
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
      } else if (result?.url) {
        // Use window.location.href for full-page redirect to ensure
        // the session cookie is properly established before the page loads.
        // router.push() can cause issues with NextAuth session timing.
        window.location.href = result.url
      } else {
        // Fallback: navigate to callback URL
        window.location.href = callbackUrl
      }
    } catch {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@web3aihub.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
