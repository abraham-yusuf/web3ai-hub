import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Analytics } from "@vercel/analytics/next";
import { BRAND } from "@/lib/brand";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ai3.my.id";

export const metadata: Metadata = {
  title: `${BRAND.name} — Platform Blog & Learning Web3 + AI`,
  description: "Belajar Web3 & AI dalam satu platform. Blog, dokumentasi, airdrop hub, dan AI tools directory.",
  applicationName: BRAND.descriptor,
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": `${APP_URL}/en`,
      "id-ID": `${APP_URL}/id`,
      "x-default": APP_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
