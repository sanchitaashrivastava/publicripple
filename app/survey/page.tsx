"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SwipeableCard } from "@/components/swipeable-card"
import { ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react"

const questions = [
  "I prefer to see content that aligns with my political beliefs",
  "I am comfortable engaging with political views that differ from my own",
  "I would rather avoid political content altogether",
  "I enjoy reading about social issues, even if the content challenges my beliefs",
  "I prefer news sources that present multiple perspectives on issues",
]

export default function SurveyPage() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, boolean>>({})
  const [showSummary, setShowSummary] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [animationTrigger, setAnimationTrigger] = useState<{ direction: "left" | "right" | null }>({ direction: null })

  // Handle swipe action
  const handleSwipe = (direction: "left" | "right") => {
    setIsTransitioning(true)

    // Record response (right = agree/true, left = disagree/false)
    setResponses((prev) => ({
      ...prev,
      [currentQuestionIndex]: direction === "right",
    }))

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
  const handleSubmit = () => {
    // In a real app, you'd send this data to your backend
    console.log("Survey responses:", responses)
    router.push("/feed")
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

          <Button onClick={handleSubmit} size="lg" className="w-full">
            Continue to News Feed
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </div>
      )}
    </div>
  )
}

