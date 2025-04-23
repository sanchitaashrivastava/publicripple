"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Info, Settings, Shield } from "lucide-react"

export default function SurveyIntroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = () => {
    setIsLoading(true)
    router.push("/survey")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple header */}
      <header className="bg-purple-900 py-4 px-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Public Ripple</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header section */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Customize Your News Experience</h1>
            <p className="text-purple-100">Let's discover what kind of news content interests you</p>
          </div>

          {/* Content section */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" />
                About the Reading Interest Survey
              </h2>

              <p className="text-gray-700 mb-4">
                You're about to take a brief survey that will help us understand what type of news articles you're
                interested in reading. This is <span className="font-medium">not</span> about your personal beliefs or
                values — it's simply about your reading preferences.
              </p>

              <p className="text-gray-700 mb-4">
                We'll show you a series of real news headlines from various sources. For each one, simply indicate
                whether you would be interested in reading that article or not. Your responses will help us curate a
                news feed that contains content you'll find engaging.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <FeatureCard
                icon={<BookOpen className="h-5 w-5 text-purple-600" />}
                title="Reading Interests Only"
                description="Your selections reflect what you want to read, not what you believe"
              />
              <FeatureCard
                icon={<Settings className="h-5 w-5 text-purple-600" />}
                title="Adjustable Anytime"
                description="You can refine your reading preferences later in settings"
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5 text-purple-600" />}
                title="Initial Setup"
                description="This helps us create your personalized news feed"
              />
            </div>

            <div className="bg-purple-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-purple-800">
                <strong>Remember:</strong> Public Ripple is designed to help you discover news that interests you. Your
                preferences help us create a personalized experience, but they don't define you. You'll always have
                control over what appears in your feed.
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleContinue}
                disabled={isLoading}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
              >
                {isLoading ? "Loading..." : "Begin Survey"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-4 px-6 border-t">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© 2025 Public Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
      <div className="mb-2">{icon}</div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
