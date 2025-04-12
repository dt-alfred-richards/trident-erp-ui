import Link from "next/link"
import { TriangleIcon as Trident, ArrowLeft } from "lucide-react"
import { ForgotPasswordForm } from "@/components/login/forgot-password-form"


export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center space-x-2">
            <Trident className="h-10 w-10 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tighter text-blue-600">Trident ERP</h1>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Reset your password</h2>
            <p className="text-sm text-slate-500">We'll send you a link to reset your password</p>
          </div>

          <ForgotPasswordForm />

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to login
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
