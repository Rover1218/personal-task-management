import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"
import type React from "react"
import { AnimatePresence } from "framer-motion"
import type { Metadata } from 'next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Personal Task Manager",
  description: "Manage your tasks efficiently",
  icons: {
    icon: [
      {
        url: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.40.0/icons/checklist.svg',
        href: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.40.0/icons/checklist.svg',
      }
    ],
    shortcut: ['https://cdn.jsdelivr.net/npm/@tabler/icons@2.40.0/icons/checklist.svg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}