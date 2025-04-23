"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Check, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react"

// Article data for the survey
const articles = [
  {
    id: 1,
    title: "Biden Cancels Student Loan Debt for 125,000 Public Service Workers",
    source: "The New York Times",
    url: "https://www.nytimes.com/2024/10/17/us/politics/student-loans-public-service.html",
    imageUrl: "/images/newyorktimes_StudentLoans.jpg",
    category: "Politics",
    excerpt:
      "The Biden administration announced it is forgiving $9 billion in student loan debt for 125,000 borrowers who work in public service.",
    color: "#4361ee",
  },
  {
    id: 2,
    title: "How AI Is Changing The Future Of Work",
    source: "Forbes",
    url: "https://www.forbes.com/sites/marenbannon/2023/06/22/how-ai-is-changing-the-future-of-work/",
    imageUrl: "/images/forbesAIWORK.jpg",
    category: "Technology",
    excerpt:
      "Artificial intelligence is rapidly transforming industries and creating new opportunities and challenges for workers across sectors.",
    color: "#3a0ca3",
  },
  {
    id: 3,
    title: "Climate Change: Not Too Late To Save The Planet If Emissions Are Reduced Now",
    source: "Brussels Times",
    url: "https://www.brusselstimes.com/180726/climate-change-not-too-late-to-save-the-planet-if-emissions-are-reduced-now-towards-climate-neutrality",
    imageUrl: "/images/ClimateChange3.jpg",
    category: "Environment",
    excerpt:
      "Scientists say there's still time to prevent the worst effects of climate change if global emissions are reduced significantly and quickly.",
    color: "#4cc9f0",
  },
  {
    id: 4,
    title: "A Fact Check On Immigration Comments Made At The Trump-Harris Debate",
    source: "NPR",
    url: "https://www.npr.org/2024/09/11/nx-s1-5107841/a-fact-check-on-immigration-comments-made-at-the-trump-harris-debate",
    imageUrl: "/images/factcheck4.jpg",
    category: "Politics",
    excerpt:
      "NPR fact-checkers analyze claims about immigration made during the presidential debate between Donald Trump and Kamala Harris.",
    color: "#f72585",
  },
  {
    id: 5,
    title: "Unmasking The Anti-Democracy Agenda Of Project 2025",
    source: "Democracy Docket",
    url: "https://www.democracydocket.com/analysis/unmasking-the-anti-democracy-agenda-of-project-2025/",
    imageUrl: "/images/anti-democracy5.png",
    category: "Politics",
    excerpt:
      "An analysis of Project 2025 and its potential implications for democratic institutions in the United States.",
    color: "#7209b7",
  },
  {
    id: 6,
    title: "The Science Is Clear: Gun Control Saves Lives",
    source: "Scientific American",
    url: "https://www.scientificamerican.com/article/the-science-is-clear-gun-control-saves-lives1/",
    imageUrl: "/images/gun6.jpg",
    category: "Health & Safety",
    excerpt:
      "Research indicates that implementing certain gun control measures can significantly reduce gun-related deaths and injuries.",
    color: "#3a86ff",
  },
  {
    id: 7,
    title: "Secretary Hegseth Says DOD Does Not Do 'Climate Change Crap'",
    source: "Fox News",
    url: "https://www.foxnews.com/politics/secretary-hegseth-says-dod-does-not-do-climate-change-crap",
    imageUrl: "/images/guy7.jpg",
    category: "Politics",
    excerpt:
      "Defense Secretary Pete Hegseth stated that the Department of Defense will focus on military readiness rather than climate change initiatives.",
    color: "#fb5607",
  },
  {
    id: 8,
    title: "The Conservative Case for Immigration",
    source: "Time",
    url: "https://time.com/6548602/conservative-case-for-immigration/",
    imageUrl: "/images/immigration8.jpg",
    category: "Politics",
    excerpt:
      "A perspective on why conservative principles can align with support for certain immigration policies and reforms.",
    color: "#ffbe0b",
  },
]

export default function SurveyPage() {
  const router = useRouter()
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, boolean>>({})
  const [showSummary, setShowSummary] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<"next" | null>(null)

  const currentArticle = articles[currentArticleIndex]
  const progress = ((currentArticleIndex + 1) / articles.length) * 100

  // Handle user selection
  const handleSelection = (interested: boolean) => {
    if (isTransitioning) return

    setIsTransitioning(true)
    setDirection("next")

    // Record response
    setResponses((prev) => ({
      ...prev,
      [currentArticleIndex]: interested,
    }))

    // Delay to show selection feedback
    setTimeout(() => {
      if (currentArticleIndex < articles.length - 1) {
        setCurrentArticleIndex((prev) => prev + 1)
      } else {
        setShowSummary(true)
      }
      setIsTransitioning(false)
    }, 600)
  }

  // Submit survey and navigate to feed
  const handleSubmit = () => {
    // In a real app, you'd send this data to your backend
    console.log("Survey responses:", responses)
    router.push("/feed")
  }

  // Open article in new tab
  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <AnimatePresence mode="wait">
        {!showSummary ? (
          <motion.div
            key="survey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto max-w-4xl"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Would you read this?</h1>
                <div className="text-sm font-medium text-gray-500">
                  Article {currentArticleIndex + 1} of {articles.length}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Category: {currentArticle.category}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
            </div>

            {/* Article card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentArticle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-8"
              >
                {/* Article image - now larger and more prominent */}
                <div className="relative w-full h-[300px] md:h-[400px]">
                  <Image
                    src={currentArticle.imageUrl || "/placeholder.svg"}
                    alt={currentArticle.title}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                        {currentArticle.category}
                      </span>
                      <span className="text-sm text-white/90 font-medium">{currentArticle.source}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{currentArticle.title}</h2>
                  </div>
                </div>

                {/* Article content */}
                <div className="p-6">
                  <p className="text-gray-700 text-lg mb-6">{currentArticle.excerpt}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openArticle(currentArticle.url)}
                    className="flex items-center gap-1 text-gray-600"
                  >
                    <ExternalLink size={16} />
                    View Original Article
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Selection buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleSelection(false)}
                disabled={isTransitioning}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors py-6"
              >
                <ThumbsDown className="h-5 w-5" />
                Not Interested
              </Button>
              <Button
                onClick={() => handleSelection(true)}
                disabled={isTransitioning}
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 border-green-200 hover:bg-green-50 hover:text-green-600 transition-colors py-6"
              >
                <ThumbsUp className="h-5 w-5" />
                Interested
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-2xl"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center mb-4"
                >
                  <Check className="h-8 w-8 text-purple-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
                <p className="text-purple-100">
                  Your reading preferences have been recorded. We'll use this information to personalize your news feed.
                </p>
              </div>

              <div className="p-8">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Your Reading Interests</h2>

                <div className="space-y-4 mb-8">
                  {articles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-50"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={article.imageUrl || "/placeholder.svg"}
                          alt={article.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{article.title}</h3>
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              responses[index] ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                            }`}
                          >
                            {responses[index] ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">{article.source}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                >
                  Continue to Your Personalized News Feed
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
