import { AppSidebar } from "@/components/layout/app-sidebar"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { ThemeProvider } from "@/components/theme/theme-provider"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"
import { AccessProvider } from "@/components/Auth/auth-context"

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
              <div className="flex-1 flex flex-col min-w-0 m-2 ml-0">
                <div className="flex h-16 items-center border-b px-4 bg-background rounded-t-xl">
                  <div className="ml-4">
                    <BreadcrumbNav />
                  </div>
                </div>
                <main className="flex-1 overflow-auto p-4 w-full bg-background rounded-b-xl">{children}</main>
              </div>
            </div>
          </ThemeProvider>
        </AccessProvider>
      </body>
    </html>
  )
}

