"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { DataByTableName } from "../api"

import { UAParser } from "ua-parser-js"
import { getChildObject } from "../generic"
import { jwtDecode } from "jwt-decode"
import { useGlobalContext } from "@/components/GlobalContext"

// Password validation requirements
const PASSWORD_REQUIREMENTS = [
    // {
    //     id: "length",
    //     label: "At least 8 characters",
    //     validator: (password: string) => password.length >= 8,
    // },
    // {
    //     id: "uppercase",
    //     label: "At least one uppercase letter",
    //     validator: (password: string) => /[A-Z]/.test(password),
    // },
    // {
    //     id: "number",
    //     label: "At least one number",
    //     validator: (password: string) => /[0-9]/.test(password),
    // },
    // {
    //     id: "special",
    //     label: "At least one special character",
    //     validator: (password: string) => /[^A-Za-z0-9]/.test(password),
    // },
]

export type IPApiResponse = {
    ip: string;
    city: string;
    region: string;
    region_code: string;
    country: string;
    country_name: string;
    continent_code: string;
    in_eu: boolean;
    postal: string;
    latitude: number;
    longitude: number;
    timezone: string;
    utc_offset: string;
    country_calling_code: string;
    currency: string;
    languages: string;
    asn: string;
    org: string;
};


export function LoginForm() {
    const parser = new UAParser();
    const result = parser.getResult();
    const router = useRouter()
    const { login = () => { } } = useGlobalContext()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
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
    const [routerInfo, setRouterInfo] = useState<Partial<IPApiResponse>>({})

    const apiInstance = new DataByTableName("")

    // Validate password whenever it changes
    // useEffect(() => {
    //     const newValidations = PASSWORD_REQUIREMENTS.reduce(
    //         (acc, requirement) => {
    //             acc[requirement.id] = requirement.validator(formData.password)
    //             return acc
    //         },
    //         {} as Record<string, boolean>,
    //     )

    //     setValidations(newValidations)
    // }, [formData.password])

    useEffect(() => {
        fetch("https://ipwho.is/")
            .then(res => res.json())
            .then(d => setRouterInfo(d))
            .catch(err => console.log("IP Fetch Failed", err));
    }, []);

    const isPasswordValid = Object.values(validations).every(Boolean)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        if (formError) setFormError("")
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, rememberMe: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setIsLoading(true)
        setIsSubmitting(true)
        e.preventDefault()
        try {
            const payload = {
                "email": formData.email,
                "password": formData.password,
                "location": `${[routerInfo.city, routerInfo.country].filter(item => item).join(",")}`,
                "deviceInfo": `${result.browser?.name || ""} on ${result.os?.name || ""}`
            }
            return login(payload, formData.rememberMe).then(() => {
                setIsLoading(false)
                setIsSubmitting(false)
            })
        } catch (error) {
            console.error("Login error:", error)
            setFormError("Authentication failed. Please check your credentials.")
            setIsLoading(false)
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-white">
                    Email or Username
                </Label>
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
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-white">
                    Password
                </Label>
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
                        className="pr-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal dark:text-white">
                    Remember me for 30 days
                </Label>
            </div>

            {formError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {formError}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
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
