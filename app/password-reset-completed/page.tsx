import Link from "next/link"
import { TriangleIcon as Trident, CheckCircle, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function PasswordResetCompletedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center space-x-2">
            <Trident className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tighter text-blue-600">Trident ERP</h1>
          </div>
          <p className="text-sm text-slate-500">Enterprise Resource Planning Solution</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-2xl font-semibold text-slate-900">Password Reset Completed</h2>

            <p className="text-slate-600">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <Link href="/login" className="w-full">
              <Button className="mt-4 w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Trident ERP. All rights reserved.
        </div>
      </div>
    </div>
  )
}
