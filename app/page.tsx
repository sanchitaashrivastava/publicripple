"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/contexts/user-context"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login } = useUser()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(email)
    router.push("/survey")
  }

  return (
    <div className="flex h-screen items-center justify-center bg-purple-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Public Ripple Logo" width={100} height={100} className="h-24 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Public Ripple</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to customize your news experience</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email-address">Email address</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

