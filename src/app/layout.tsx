import type { Metadata } from "next"
import { Instrument_Sans } from "next/font/google"
import "./globals.css"

const instrument = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SignalPulse — Find Customers Already Asking for What You Build",
  description:
    "AI-powered lead discovery from social conversations. We find people already asking for what you sell on Reddit, X, LinkedIn, and more. First leads in 24 hours.",
  openGraph: {
    title: "SignalPulse — Find Customers Already Asking for What You Build",
    description:
      "AI-powered lead discovery from social conversations. First leads in 24 hours.",
    siteName: "SignalPulse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalPulse — Find Customers Already Asking for What You Build",
    description:
      "AI-powered lead discovery from social conversations. First leads in 24 hours.",
  },
}

import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${instrument.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-deep text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
