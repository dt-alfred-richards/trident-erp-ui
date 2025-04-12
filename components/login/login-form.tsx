"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import axiosInstance, { DataByTableName } from "../utils/api"

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

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [validations, setValidations] = useState<Record<string, boolean>>({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const [formError, setFormError] = useState("")

  // Validate password whenever it changes
  useEffect(() => {
    const newValidations = PASSWORD_REQUIREMENTS.reduce(
      (acc, requirement) => {
        acc[requirement.id] = requirement.validator(formData.password)
        return acc
      },
      {} as Record<string, boolean>,
    )

    setValidations(newValidations)
  }, [formData.password])

  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  useEffect(() => {
    if (token) {
      router.push("/")
    }
  }, [token])

  const isPasswordValid = Object.values(validations).every(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (formError) setFormError("")
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()

    const { email, password, rememberMe } = formData

    const instance = new DataByTableName("");

    setIsLoading(true)
    instance.login({ email, password }).then(res => {
      const { token = "", role = "" } = res;
      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("role", role);
      }
    }).then(() => {
      router.push("")
    }).catch(() => {
      setFormError("Authentication failed")
    })
      .finally(() => {
        setIsLoading(false);
      })
  }, [formData])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email or Username</Label>
        <Input
          id="email"
          name="email"
          type="text"
          placeholder="name@company.com"
          autoComplete="username"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={formData.password}
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
        {(false) && (
          // {(passwordFocused || formData.password) && (
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

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={formData.rememberMe}
          onCheckedChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <Label htmlFor="remember" className="text-sm font-normal">
          Remember me for 30 days
        </Label>
      </div>

      {formError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{formError}</div>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}
