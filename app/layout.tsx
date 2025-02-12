import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"
import type React from "react"
import { AnimatePresence } from "framer-motion"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Personal Task Manager",
  description: "Manage your tasks efficiently",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AnimatePresence mode="wait">{children}</AnimatePresence>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'