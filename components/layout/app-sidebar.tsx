"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  Boxes,
  Truck,
  Users,
  BarChart3,
  DollarSign,
  ChevronDown,
  Package,
  Workflow,
  BookOpen,
  Menu,
  ShoppingBag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// Define navigation items with categories
const navigationItems = [
  {
    category: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    category: "Operations",
    items: [
      {
        href: "/sales",
        label: "Sales",
        icon: ShoppingCart,
      },
      {
        href: "/production",
        label: "Production",
        icon: Factory,
      },
      {
        href: "/inventory",
        label: "Inventory",
        icon: Boxes,
        subItems: [
          {
            href: "/inventory/finished-goods",
            label: "Finished Goods",
          },
          {
            href: "/inventory/raw-materials",
            label: "Raw Materials",
          },
        ],
      },
      {
        href: "/logistics",
        label: "Logistics",
        icon: Truck,
      },
      {
        href: "/procurement",
        label: "Procurement",
        icon: ShoppingBag,
      },
    ],
  },
  {
    category: "Management",
    items: [
      {
        href: "/hr",
        label: "HR",
        icon: Users,
      },
      {
        href: "/finance",
        label: "Finance",
        icon: DollarSign,
      },
      {
        href: "/bom",
        label: "BOM",
        icon: BookOpen,
      },
    ],
  },
  {
    category: "Analysis",
    items: [
      {
        href: "/reports",
        label: "Reports",
        icon: BarChart3,
      },
      {
        href: "/workflows",
        label: "Workflows",
        icon: Workflow,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "h-[calc(100vh-16px)] flex flex-col border transition-all duration-300 rounded-xl shadow-sm m-2",
        collapsed ? "w-16" : "w-64",
        "bg-[#f9fafb] dark:bg-[hsl(var(--sidebar-background))]",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4 justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Dhaara ERP</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-2 px-2">
        {!collapsed &&
          navigationItems.map((category, index) => (
            <Collapsible key={category.category} defaultOpen className="group/collapsible">
              <div className={cn("px-2", index > 0 ? "mt-6" : "")}>
                {/* Category Header */}
                <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                  <span className="text-sm font-medium text-muted-foreground">{category.category}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <div key={item.href}>
                        {item.subItems ? (
                          <Collapsible className="w-full">
                            <CollapsibleTrigger className="w-full">
                              <div className="group relative flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors bg-transparent hover:bg-muted justify-between">
                                <div className="flex items-center">
                                  <item.icon className="h-4 w-4 mr-3" />
                                  <span className="font-normal">{item.label}</span>
                                </div>
                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="ml-6 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                                      pathname === subItem.href && "bg-muted font-medium",
                                    )}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <Link
                            href={item.href}
                            className={cn(
                              "group relative flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors bg-transparent hover:bg-muted",
                              pathname === item.href && "bg-muted font-medium",
                            )}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
                            <span className="font-normal">{item.label}</span>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}

        {collapsed && (
          <div className="flex flex-col items-center space-y-4 py-4">
            {navigationItems.flatMap((category) =>
              category.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted",
                    pathname === item.href && "bg-muted",
                  )}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              )),
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center border-t p-4 mt-auto justify-between">
        {!collapsed ? (
          <>
            <UserNav />
            <ThemeToggle />
          </>
        ) : (
          <ThemeToggle className="mx-auto" />
        )}
      </div>
    </div>
  )
}

