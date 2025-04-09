"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArticleComparison } from "@/components/article-comparison"
import { motion, AnimatePresence } from "framer-motion"
// Note: Removed TrendingDown, TrendingUp, MinusIcon as they are no longer needed for the summary
import { ArrowRight, Check, ChevronLeft, Loader2 } from "lucide-react"
import { submitSurveyAction } from "@/app/actions"

// --- Constants ---
const LEFT_COLOR_HEX = "#6366f1"; // Indigo-500
const RIGHT_COLOR_HEX = "#ec4899"; // Pink-500
const NEUTRAL_COLOR_HEX = "#6b7280"; // Gray-500

// --- Data ---
const articlePairs = [
    { id: 1, topic: "Gun Control", left: { title: "The Science Is Clear: Gun Control Saves Lives", source: "Scientific American", url: "#", imageUrl: "/placeholder.jpg" }, right: { title: "Why Gun Control Doesn't Work", source: "NRA-ILA", url: "#", imageUrl: "/placeholder-user.jpg" }},
    { id: 2, topic: "Climate Change", left: { title: "Climate Change Requires Radical, Immediate Action", source: "Pitt News", url: "#", imageUrl: "/placeholder.svg" }, right: { title: "Secretary Hegseth Says DOD Does Not Do 'Climate Change Crap'", source: "Fox News", url: "#", imageUrl: "/placeholder-logo.svg" }},
    { id: 3, topic: "Healthcare", left: { title: "Healthcare Reform Needed", source: "Source L3", url: "#", imageUrl: "/placeholder.jpg" }, right: { title: "Fight Politicization of Medicine", source: "Source R3", url: "#", imageUrl: "/placeholder-user.jpg" }},
    { id: 4, topic: "Immigration", left: { title: "Citizenship Boosts Economy", source: "Source L4", url: "#", imageUrl: "/placeholder.svg" }, right: { title: "Conservative Case for Immigration", source: "Source R4", url: "#", imageUrl: "/placeholder-logo.svg" }},
    { id: 5, topic: "Tax Policy", left: { title: "Tax Cuts Benefit Wealthy", source: "Source L5", url: "#", imageUrl: "/placeholder.jpg" }, right: { title: "Case for 15% Corporate Tax", source: "Source R5", url: "#", imageUrl: "/placeholder-user.jpg" }},
];

// --- Types ---
type Response = "left" | "center" | "right" | null
type SurveyResponsesState = Record<number, Response>;

// --- Component ---
export default function SurveyPage() {
  const router = useRouter()
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [responses, setResponses] = useState<SurveyResponsesState>({})
  const [showSummary, setShowSummary] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null)

  const currentPair = articlePairs[currentPairIndex]
  const progress = ((currentPairIndex + 1) / articlePairs.length) * 100

  // --- Event Handlers ---
  const handleSelection = (selection: Response) => {
    if (isTransitioning || isSubmitting) return
    setIsTransitioning(true)
    setDirection("next")
    setResponses((prev) => ({ ...prev, [currentPair.id]: selection }))
    setTimeout(() => {
      if (currentPairIndex < articlePairs.length - 1) {
        setCurrentPairIndex((prev) => prev + 1)
      } else {
        setShowSummary(true)
      }
      setIsTransitioning(false)
    }, 400)
  }

  const handlePrevious = () => {
    if (currentPairIndex > 0 && !isTransitioning && !isSubmitting) {
      setIsTransitioning(true)
      setDirection("prev")
      setTimeout(() => {
        setCurrentPairIndex((prev) => prev - 1)
        setIsTransitioning(false)
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log("Submitting survey responses:", responses);
    try {
      await submitSurveyAction(responses); // Ensure this action exists and works
      router.push("/feed");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      alert("Error saving preferences. Please try again.");
      setIsSubmitting(false);
    }
  }

  // --- Helper ---
  // Restored getResponseLabel for summary text
   const getResponseLabel = (response: Response): string => {
    switch (response) {
      case "left": return "Leaned Left";
      case "center": return "Neutral";
      case "right": return "Leaned Right";
      default: return "Not Answered";
    }
  }


  // --- Rendering ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4 overflow-x-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        {!showSummary ? (
          // --- Survey View ---
          <motion.div
            key={`survey-${currentPairIndex}`}
            initial="hidden" animate="visible" exit="exit"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }}
            className="container mx-auto max-w-6xl flex flex-col"
            style={{ minHeight: 'calc(90vh)' }}
          >
            {/* Header */}
            <div className="mb-6 md:mb-8 px-2 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                   Topic: {currentPair.topic}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                    ({currentPairIndex + 1} of {articlePairs.length}) Select the perspective you lean towards.
                </p>
            </div>

            {/* Comparison Component */}
            <div className="flex-grow flex items-center justify-center mb-6 md:mb-8 w-full">
              {currentPair && (
                 <ArticleComparison
                    key={currentPair.id}
                    leftArticle={currentPair.left}
                    rightArticle={currentPair.right}
                    onSelect={handleSelection}
                    selectedOption={responses[currentPair.id] || null}
                    isTransitioning={isTransitioning}
                    direction={direction}
                 />
              )}
            </div>

             {/* Navigation & Progress */}
             <div className="flex items-center justify-between mt-auto px-2 gap-4">
                 <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPairIndex === 0 || isTransitioning || isSubmitting}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                 </Button>
                 <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden max-w-sm mx-auto">
                     <motion.div
                         className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full"
                         initial={{ width: `${(currentPairIndex / articlePairs.length) * 100}%` }}
                         animate={{ width: `${progress}%` }}
                         transition={{ duration: 0.4, ease: "circOut" }}
                     />
                 </div>
                 <div className="text-sm font-medium text-gray-600 w-16 text-right">
                     {Math.round(progress)}%
                 </div>
            </div>
          </motion.div>

        ) : (
          // --- Summary View ---
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="container mx-auto max-w-lg"
          >
            <div className="bg-white rounded-xl shadow-xl border border-gray-100">
              {/* Summary Header */}
              <div className="p-8 text-center border-b border-gray-200">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 150 }} className="mx-auto bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-indigo-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Profile Complete!</h1>
                <p className="text-gray-500 text-sm">Your perspective helps us personalize your feed.</p>
              </div>

              {/* Summary List - Reverted Bar Style */}
              <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-5 text-gray-700">Your Choices</h2>
                <div className="space-y-5"> {/* Increased spacing */}
                  {articlePairs.map((pair) => (
                    <motion.div
                      key={pair.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (pair.id - 1) * 0.07 }}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-100" // Slightly more padding
                    >
                       <div className="flex justify-between items-center mb-3"> {/* Increased margin-bottom */}
                        <h3 className="font-medium text-sm text-gray-800">{pair.topic}</h3>
                        {/* Text label indicating the choice */}
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            responses[pair.id] === 'left' ? 'bg-indigo-100 text-indigo-700' :
                            responses[pair.id] === 'right' ? 'bg-pink-100 text-pink-700' :
                            responses[pair.id] === 'center' ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {getResponseLabel(responses[pair.id] || null)}
                        </div>
                      </div>

                      {/* Reverted Segmented Bar */}
                       <div className="w-full h-2.5 flex rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                         {/* Left Segment */}
                         <div
                            className="h-full transition-colors duration-300 ease-out"
                            style={{
                              width: '33.33%',
                              backgroundColor: responses[pair.id] === 'left' ? LEFT_COLOR_HEX : 'transparent'
                            }}
                          />
                          {/* Center Segment */}
                          <div
                            className="h-full transition-colors duration-300 ease-out border-l border-r border-gray-300" // Dividers
                            style={{
                              width: '33.34%',
                              backgroundColor: responses[pair.id] === 'center' ? NEUTRAL_COLOR_HEX : 'transparent'
                            }}
                          />
                          {/* Right Segment */}
                          <div
                            className="h-full transition-colors duration-300 ease-out"
                            style={{
                              width: '33.33%',
                              backgroundColor: responses[pair.id] === 'right' ? RIGHT_COLOR_HEX : 'transparent'
                            }}
                          />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer Button */}
               <div className="p-6 border-t border-gray-100">
                   <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-base font-semibold text-white shadow transition-all duration-300">
                       {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2" size={20} />}
                       {isSubmitting ? "Saving..." : "Go to My Feed"}
                   </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}