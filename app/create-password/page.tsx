import { CreatePasswordForm } from "@/components/login/create-password-form"
import { TriangleIcon as Trident } from "lucide-react"


export default function CreatePasswordPage() {
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

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold">Create New Password</h2>
            <p className="text-sm text-slate-500">Please create a new password for your account</p>
          </div>

          <CreatePasswordForm />
        </div>

        <div className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Trident ERP. All rights reserved.
        </div>
      </div>
    </div>
  )
}
