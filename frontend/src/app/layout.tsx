import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CRMFlow - Visual IDE for Building Intelligent Voice-Driven Workflows',
  description:
    'A no-code visual design studio that empowers businesses to create intelligent, voice-driven workflows.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#141414] text-white`}>{children}</body>
    </html>
  )
}
