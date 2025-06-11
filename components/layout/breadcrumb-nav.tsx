"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Skip for home page
  if (pathname === "/") return null

  // Split the pathname into segments
  const segments = pathname.split("/").filter(Boolean)

  // Create breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    return {
      href,
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
    }
  })
  if (pathname === "/login") return null
  return (
    <nav className="flex items-center text-sm">
      <Link href="/" className="text-muted-foreground hover:text-foreground">
        Home
      </Link>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
          {index === breadcrumbs.length - 1 ? (
            <span className="font-medium">{breadcrumb.label}</span>
          ) : (
            <Link href={breadcrumb.href} className="text-muted-foreground hover:text-foreground">
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
