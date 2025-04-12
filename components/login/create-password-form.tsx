"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Password validation requirements
const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "At least 8 characters",
    validator: (password: string) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter",
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "At least one number",
    validator: (password: string) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "At least one special character",
    validator: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
]

export function CreatePasswordForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [validations, setValidations] = useState<Record<string, boolean>>({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false,
  })
  const [formError, setFormError] = useState("")

  useEffect(() => {
    // Get email from session storage if available
    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem("userEmail") || ""
      setUserEmail(email)
    }
  }, [])

  // Validate password whenever it changes
  useEffect(() => {
    const newValidations = PASSWORD_REQUIREMENTS.reduce(
      (acc, requirement) => {
        acc[requirement.id] = requirement.validator(formData.newPassword)
        return acc
      },
      {} as Record<string, boolean>,
    )

    // Add password match validation
    newValidations.match =
      formData.newPassword !== "" &&
      formData.confirmPassword !== "" &&
      formData.newPassword === formData.confirmPassword

    setValidations(newValidations)
  }, [formData.newPassword, formData.confirmPassword])

  const isPasswordValid = Object.values(validations).every(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formError) setFormError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password before submission
    if (!isPasswordValid) {
      setFormError("Please ensure your password meets all requirements and both passwords match.")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real application, you would update the password in your backend here
      // const response = await fetch('/api/auth/update-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: userEmail,
      //     password: formData.newPassword
      //   }),
      // })

      // if (!response.ok) throw new Error('Failed to update password')

      // Clear session storage
      sessionStorage.removeItem("userEmail")

      // Redirect to password reset completed page instead of dashboard
      router.push("/password-reset-completed")
    } catch (error) {
      console.error("Password update error:", error)
      setFormError("Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {userEmail && (
        <div className="mb-4 rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-700">
            Creating new password for: <strong>{userEmail}</strong>
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={formData.newPassword}
            onChange={handleChange}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Password requirements checklist */}
        {(passwordFocused || formData.newPassword) && (
          <div className="mt-2 rounded-md bg-slate-50 p-3">
            <p className="mb-2 text-xs font-medium text-slate-700">Password requirements:</p>
            <ul className="space-y-1 text-xs">
              {PASSWORD_REQUIREMENTS.map((requirement) => (
                <li key={requirement.id} className="flex items-center">
                  {validations[requirement.id] ? (
                    <CheckCircle2 className="mr-2 h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-3 w-3 text-red-500" />
                  )}
                  <span className={validations[requirement.id] ? "text-green-700" : "text-slate-600"}>
                    {requirement.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formData.confirmPassword && !validations.match && (
          <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
        )}
      </div>

      {formError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{formError}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating password...
          </>
        ) : (
          "Create Password"
        )}
      </Button>
    </form>
  )
}
