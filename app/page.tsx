"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Newspaper, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            News that matches <span className="text-purple-700">your perspective</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Public Ripple helps you discover news content that either aligns with your views or thoughtfully challenges
            them—you decide how far to step outside your comfort zone.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-8"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6 text-purple-600" />}
            title="Personalized Feed"
            description="News tailored to your political preferences and comfort level"
          />
          <FeatureCard
            icon={<Sparkles className="h-6 w-6 text-purple-600" />}
            title="Preference Survey"
            description="Simple interactive survey to understand your viewpoints"
          />
          <FeatureCard
            icon={<ArrowRight className="h-6 w-6 text-purple-600" />}
            title="Expand Horizons"
            description="Gradually explore different perspectives at your own pace"
          />
        </div>
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
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="mb-4 bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
