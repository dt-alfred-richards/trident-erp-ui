import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"
import { OrderProvider } from "@/contexts/order-context"
import { Poppins } from "next/font/google"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

// Initialize the Poppins font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Dhaara ERP",
  description: "Enterprise Resource Planning System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn("antialiased", poppins.variable)}>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <OrderProvider>
            <div className="flex h-screen w-full overflow-hidden bg-muted/20">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 m-2 ml-0">
                <div className="flex h-16 items-center border-b px-4 bg-background rounded-t-xl">
                  <div className="ml-4">
                    <BreadcrumbNav />
                  </div>
                </div>
                <main className="flex-1 overflow-auto p-4 w-full bg-[#ffffff] dark:bg-[#020817] rounded-b-xl">
                  {children}
                </main>
              </div>
            </div>
          </OrderProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
