import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile | Dhaara ERP",
  description: "User profile and account settings",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
