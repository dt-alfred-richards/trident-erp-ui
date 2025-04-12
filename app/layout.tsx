import { AppSidebar } from "@/components/layout/app-sidebar"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { ThemeProvider } from "@/components/theme/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"
import { AccessProvider, useAccess } from "@/components/Auth/auth-context"
import { ReactNode } from "react"
import { BreadCrumb } from "./BreadCrum"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dhaara ERP",
  description: "Factory Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AccessProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex h-screen w-full overflow-hidden bg-muted/20">
              <AppSidebar />
              <BreadCrumb>{children}</BreadCrumb>
            </div>
          </ThemeProvider>
        </AccessProvider>
      </body>
    </html>
  )
}

