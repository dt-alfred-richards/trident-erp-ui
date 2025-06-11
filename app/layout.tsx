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
import LayoutHelper from "./LayoutHelper"
import { GlobalProvider } from "@/components/GlobalContext"

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
        <GlobalProvider>
          <LayoutHelper>{children}</LayoutHelper>
        </GlobalProvider>
      </body>
    </html >
  )
}
