export { auth as proxy } from "@/auth"

export const config = {
  // Only admin routes require auth checks; other routes stay public.
  matcher: ["/admin/:path*"],
}
