"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
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
  BookOpen,
  Menu,
  ShoppingBag,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { UserNav } from "@/components/layout/user-nav"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Poppins } from "next/font/google"

// Initialize the Poppins font with lighter weights
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-poppins",
})

// Dashboard as a standalone item
const dashboardItem = {
  href: "/",
  label: "Dashboard",
  icon: LayoutDashboard,
}

// Update the navigationItems array to include subitems for Logistics
const navigationItems = [
  {
    category: "Operations",
    items: [
      {
        href: "/sales",
        label: "Sales",
        icon: ShoppingCart,
        subItems: [
          {
            href: "/sales/order-book",
            label: "Order Book",
          },
          {
            href: "/sales/client-list",
            label: "Client List",
          },
        ],
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
        subItems: [
          {
            href: "/logistics/shipment-tracking",
            label: "Shipment Tracking",
          },
          {
            href: "/logistics/vehicles-drivers",
            label: "Vehicles & Drivers List",
          },
        ],
      },
      {
        href: "/procurement",
        label: "Procurement",
        icon: ShoppingBag,
        subItems: [
          {
            href: "/procurement/purchase-orders",
            label: "Purchase Order - TB",
          },
          {
            href: "/procurement/suppliers",
            label: "Supplier List",
          },
        ],
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
    ],
  },
]

export function AppSidebar() {
  // Add the poppins class to the component
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Initialize expanded state based on current path
  useEffect(() => {
    const newExpandedItems: Record<string, boolean> = {}

    navigationItems.forEach((category) => {
      category.items.forEach((item) => {
        if (item.subItems) {
          const isActive = item.subItems.some((subItem) => pathname === subItem.href)
          if (isActive) {
            newExpandedItems[item.label] = true
          }
        }
      })
    })

    setExpandedItems(newExpandedItems)
  }, [pathname])

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  if (pathname === "/login" || pathname === "/contact") return null

  return (
    <motion.div
      initial={{ opacity: 0.8, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-[calc(100vh-16px)] flex flex-col transition-all duration-300 rounded-2xl m-2 font-['Poppins'] text-[15px] font-light",
        collapsed ? "w-16" : "w-64",
        "bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-lg backdrop-blur-sm",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center px-4 justify-between backdrop-blur-md rounded-t-2xl border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80">
        {!collapsed && (
          <div className="flex items-center">
            <div className="relative h-8 w-auto">
              <Image
                src="/images/dhaara-logo.png"
                alt="Dhaara Logo"
                width={120}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-8 w-8 text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-full",
            collapsed && "mx-auto",
          )}
        >
          <Menu className="h-4 w-4" />
        </Button>
        {collapsed && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4">
            <Image
              src="/images/dhaara-logo.png"
              alt="Dhaara Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto py-3 px-3 scrollbar-hide">
        {!collapsed && (
          <>
            {/* Dashboard as standalone item */}
            <div className="px-2 mb-6">
              <Link
                href={dashboardItem.href}
                className={cn(
                  "group relative flex w-full items-center rounded-md px-2.5 py-1 text-sm transition-all duration-200 ease-in-out",
                  pathname === dashboardItem.href
                    ? "bg-[#1b84ff] text-white font-normal shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md mr-1.5",
                    pathname === dashboardItem.href
                      ? "bg-[#1b84ff]/20 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                  )}
                >
                  <dashboardItem.icon className="h-4 w-4" />
                </div>
                <span className={pathname === dashboardItem.href ? "font-normal" : "font-light"}>
                  {dashboardItem.label}
                </span>

                {pathname === dashboardItem.href && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 h-2 w-2 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </div>

            {/* Categories */}
            {navigationItems.map((category, index) => (
              <Collapsible key={category.category} defaultOpen className="group/collapsible">
                <div className={cn("px-2", index > 0 ? "mt-6" : "")}>
                  {/* Category Header */}
                  <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                    <span className="text-xs uppercase tracking-wider text-black dark:text-white font-light">
                      {category.category}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 transition-transform group-data-[state=closed]/collapsible:rotate-[-90deg]" />
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="space-y-4">
                      {category.items.map((item) => (
                        <div key={item.href}>
                          {item.subItems ? (
                            <div className="mb-1">
                              <button
                                onClick={() => toggleExpanded(item.label)}
                                className={cn(
                                  "group relative flex w-full items-center rounded-md px-2.5 py-1 text-sm transition-all duration-200 ease-in-out",
                                  pathname.startsWith(item.href)
                                    ? "bg-[#1b84ff] text-white font-normal shadow-sm"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                                )}
                              >
                                <div className="flex items-center flex-1">
                                  <div
                                    className={cn(
                                      "flex h-6 w-6 items-center justify-center rounded-md mr-1.5",
                                      pathname.startsWith(item.href)
                                        ? "bg-[#1b84ff]/20 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                                    )}
                                  >
                                    <item.icon className="h-4 w-4" />
                                  </div>
                                  <span className={pathname.startsWith(item.href) ? "font-normal" : "font-light"}>
                                    {item.label}
                                  </span>
                                </div>
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    expandedItems[item.label] ? "rotate-90" : "",
                                    pathname.startsWith(item.href) ? "text-white" : "text-gray-400 dark:text-gray-500",
                                  )}
                                />
                              </button>

                              {expandedItems[item.label] && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-10 mt-1 space-y-1 pl-2 border-l-2 border-gray-200 dark:border-gray-700"
                                >
                                  {item.subItems.map((subItem) => (
                                    <Link
                                      key={subItem.href}
                                      href={subItem.href}
                                      className={cn(
                                        "flex w-full items-center rounded-md px-2 py-1 text-sm transition-all duration-200",
                                        pathname === subItem.href
                                          ? "text-[#1b84ff] dark:text-[#1b84ff] font-normal"
                                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-light",
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 h-1.5 w-1.5 rounded-full",
                                          pathname === subItem.href
                                            ? "bg-[#1b84ff] dark:bg-[#1b84ff]"
                                            : "bg-gray-300 dark:bg-gray-600",
                                        )}
                                      />
                                      {subItem.label}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={cn(
                                "group relative flex w-full items-center rounded-md px-2.5 py-1 text-sm transition-all duration-200 ease-in-out",
                                pathname === item.href
                                  ? "bg-[#1b84ff] text-white font-normal shadow-sm"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-md mr-1.5",
                                  pathname === item.href
                                    ? "bg-[#1b84ff]/20 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300",
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                              </div>
                              <span className={pathname === item.href ? "font-normal" : "font-light"}>
                                {item.label}
                              </span>

                              {pathname === item.href && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute right-2 h-2 w-2 rounded-full bg-white"
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                              )}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </>
        )}

        {collapsed && (
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* Dashboard in collapsed view */}
            <Link
              href={dashboardItem.href}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                pathname === dashboardItem.href
                  ? "bg-[#1b84ff] text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
              title={dashboardItem.label}
            >
              <dashboardItem.icon className="h-5 w-5" />

              {pathname === dashboardItem.href && (
                <motion.div
                  layoutId="activeIndicatorCollapsed"
                  className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>

            {/* Other items in collapsed view */}
            {navigationItems.flatMap((category) =>
              category.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
                    pathname === item.href || pathname.startsWith(item.href)
                      ? "bg-[#1b84ff] text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                  title={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Link>
              )),
            )}
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between h-16 px-4 backdrop-blur-md rounded-b-2xl border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80">
        <ThemeToggle />
        <UserNav collapsed={collapsed} />
      </div>
    </motion.div>
  )
}
