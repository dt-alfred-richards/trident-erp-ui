"use client"

import { AppSidebar } from '@/components/layout/app-sidebar'
import { BreadcrumbNav } from '@/components/layout/breadcrumb-nav'
import { OrderProvider } from '@/contexts/order-context'
import { ThemeProvider } from 'next-themes'
import { ReactNode, useEffect, useState } from 'react'
import { GlobalProvider } from './GlobalContext'
import { InventoryProvider } from './inventory-context'

const LayoutHelper = ({ children }: { children: ReactNode }) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null;
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <GlobalProvider>
                <InventoryProvider>
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
                </InventoryProvider>
            </GlobalProvider>
        </ThemeProvider>
    )
}

export default LayoutHelper