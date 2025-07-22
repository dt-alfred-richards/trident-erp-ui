import type React from "react"
import type { Metadata } from "next"
import { EventsProvider } from "./events-context"

export const metadata: Metadata = {
  title: "Profile | Dhaara ERP",
  description: "User profile and account settings",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <EventsProvider>{children}</EventsProvider>
}
