import Link from "next/link"
import { TriangleIcon as Trident } from "lucide-react"
import { LoginForm } from "@/components/login/login-form"


export default function LoginPage() {
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
            <h2 className="text-xl font-semibold">Sign in to your account</h2>
            <p className="text-sm text-slate-500">Enter your credentials to access your dashboard</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                Contact your administrator
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Trident ERP. All rights reserved.
        </div>
      </div>
    </div>
  )
}
