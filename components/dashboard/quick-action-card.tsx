"use client"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

interface QuickActionCardProps {
  title: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
}

export function QuickActionCard({ title, icon: Icon, onClick, href }: QuickActionCardProps) {
  const content = (
    <Card className="hover:bg-accent transition-colors cursor-pointer">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center h-[100px]">
        <Icon className="h-8 w-8 mb-2 text-primary" />
        <span className="text-sm font-medium">{title}</span>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return <div onClick={onClick}>{content}</div>
}

