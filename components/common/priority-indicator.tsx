import { Flag } from "lucide-react"

interface PriorityIndicatorProps {
  priority: string
}

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500"
      case "medium":
        return "text-amber-500"
      case "low":
        return "text-green-500"
      default:
        return ""
    }
  }

  return (
    <div className="flex items-center">
      <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(priority)}`} />
      <span className="capitalize">{priority}</span>
    </div>
  )
}
