"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SwipeableCard } from "@/components/swipeable-card"
import { ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { updateSurveyResponses, getSurveyResponses, hasCompletedSurvey } from "@/services/db-service"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const questions = [
  "I prefer to see content that aligns with my political beliefs",
  "I am comfortable engaging with political views that differ from my own",
  "I would rather avoid political content altogether",
  "I enjoy reading about social issues, even if the content challenges my beliefs",
  "I prefer news sources that present multiple perspectives on issues",
]

export default function SurveyPage() {
  const router = useRouter()
  const { user } = useUser()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, boolean>>({})
  const [showSummary, setShowSummary] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [animationTrigger, setAnimationTrigger] = useState<{ direction: "left" | "right" | null }>({ direction: null })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in and load any existing responses
  useEffect(() => {
    async function checkUserAndLoadResponses() {
      if (!user) {
        // If not logged in, redirect to login page
        toast({
          title: "Please log in",
          description: "You need to be logged in to take the survey",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      try {
        setIsLoading(true)

        // Check if user has already completed the survey
        const hasSurvey = await hasCompletedSurvey(user.email)

        if (hasSurvey) {
          // Load existing responses
          const existingResponses = await getSurveyResponses(user.email)

          if (existingResponses) {
            // Convert from object format to record format
            const formattedResponses: Record<number, boolean> = {
              0: existingResponses.q1,
              1: existingResponses.q2,
              2: existingResponses.q3,
              3: existingResponses.q4,
              4: existingResponses.q5,
            }

            setResponses(formattedResponses)

            // If they have completed all questions, show the summary
            setCurrentQuestionIndex(questions.length - 1)
            setShowSummary(true)
          }
        }
      } catch (error) {
        console.error("Error checking user survey status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndLoadResponses()
  }, [user, router])

  // Handle swipe action
  const handleSwipe = (direction: "left" | "right") => {
    setIsTransitioning(true)

    // Record response (right = agree/true, left = disagree/false)
    const isAgree = direction === "right"
    setResponses((prev) => ({
      ...prev,
      [currentQuestionIndex]: isAgree,
    }))

    console.log(`Question ${currentQuestionIndex + 1}: User ${isAgree ? "agreed" : "disagreed"}`)

    // Move to next question or show summary if done
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        setShowSummary(true)
      }
      setIsTransitioning(false)
      // Reset animation trigger
      setAnimationTrigger({ direction: null })
    }, 500)
  }

  // Handle manual navigation with buttons
  const handleButtonClick = (agree: boolean) => {
    // Trigger animation
    setAnimationTrigger({ direction: agree ? "right" : "left" })

    // The actual navigation happens in the onSwipe callback
    // which is triggered after the animation completes
  }

  // Submit survey and navigate to feed
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the survey",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    try {
      setIsSaving(true)

      console.log("Saving survey responses:", responses)

      // Save survey responses to database
      const result = await updateSurveyResponses(user.email, responses)

      if (!result) {
        throw new Error("Failed to save survey responses")
      }

      toast({
        title: "Success",
        description: "Your preferences have been saved. Your news feed is now personalized!",
      })

      // Navigate to feed
      router.push("/feed")
    } catch (error) {
      console.error("Error saving survey responses:", error)
      toast({
        title: "Error",
        description: "Failed to save your responses",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p className="mt-4">Loading your preferences...</p>
      </div>
    )
  }

  // If not logged in, redirect to login page
  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to take the survey.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Go to Login
        </Button>
      </div>
    )
  }

  // Calculate progress percentage
  const progress = (currentQuestionIndex / questions.length) * 100

  return (
    <div className="container mx-auto max-w-md py-8 px-4">
      {!showSummary ? (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">News Preference Survey</h1>
            <p className="text-muted-foreground">Swipe right if you agree, left if you disagree</p>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Card stack */}
          <div className="relative h-[400px] w-full">
            {questions.map((question, index) => (
              <div key={index} style={{ display: Math.abs(currentQuestionIndex - index) <= 1 ? "block" : "none" }}>
                <SwipeableCard
                  question={question}
                  onSwipe={handleSwipe}
                  isActive={currentQuestionIndex === index && !isTransitioning}
                  animationTrigger={currentQuestionIndex === index ? animationTrigger : { direction: null }}
                />
              </div>
            ))}
          </div>

          {/* Alternative buttons for clicking instead of swiping */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleButtonClick(false)}
              className="flex-1 flex items-center justify-center gap-2 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
              disabled={isTransitioning}
            >
              <ThumbsDown size={18} />
              Disagree
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleButtonClick(true)}
              className="flex-1 flex items-center justify-center gap-2 border-green-200 hover:bg-green-50 hover:text-green-600 transition-colors"
              disabled={isTransitioning}
            >
              <ThumbsUp size={18} />
              Agree
            </Button>
          </div>
        </>
      ) : (
        // Summary screen
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
          <p className="mb-8">
            Your preferences have been recorded. We'll use this information to personalize your news feed.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Your Responses</h2>
            <ul className="space-y-4 text-left">
              {questions.map((question, index) => (
                <li key={index} className="flex items-start gap-3">
                  {responses[index] ? (
                    <ThumbsUp className="text-green-500 shrink-0 mt-1" size={18} />
                  ) : (
                    <ThumbsDown className="text-red-500 shrink-0 mt-1" size={18} />
                  )}
                  <span className="text-sm">{question}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Continue to News Feed"}
            {!isSaving && <ArrowRight className="ml-2" size={18} />}
          </Button>
        </div>
      )}
      <Toaster />
    </div>
  )
}
