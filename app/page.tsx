"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/contexts/user-context"
import Image from "next/image"
import { getUserByEmail, createUser, loginUser, hasCompletedSurvey } from "@/services/db-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useUser()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Attempt to login
      const user = await loginUser(email, password)

      if (!user) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      // Login successful
      login(email)

      // Check if user has completed survey
      const hasSurvey = await hasCompletedSurvey(email)

      if (hasSurvey) {
        // Redirect returning users directly to feed
        router.push("/feed")
      } else {
        // Redirect new users to survey
        router.push("/survey")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(email)

      if (existingUser) {
        setError("User already exists. Please login instead.")
        setIsLoading(false)
        return
      }

      // Create new user
      const newUser = await createUser(email, password)

      if (!newUser) {
        throw new Error("Failed to create user")
      }

      // Login the new user
      login(email)

      // Show toast notification
      toast({
        title: "Account created",
        description: "Your account has been created successfully! Please complete the survey to personalize your feed.",
      })

      // Redirect new users to survey
      router.push("/survey")
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-purple-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Public Ripple Logo" width={100} height={100} className="h-24 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Public Ripple</h2>
          <p className="mt-2 text-sm text-gray-600">Customize your news experience</p>
        </div>

        {!isSupabaseConfigured() && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm mb-4">
            Database connection not configured. Using local storage for demo purposes.
          </div>
        )}

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="mt-4 space-y-6">
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <Label htmlFor="login-email">Email address</Label>
                  <Input
                    id="login-email"
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
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
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
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="mt-4 space-y-6">
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <Label htmlFor="signup-email">Email address</Label>
                  <Input
                    id="signup-email"
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
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                By signing up, you'll be asked to complete a short survey to personalize your news feed.
              </p>
            </form>
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </div>
  )
}
