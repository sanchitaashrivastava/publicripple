"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsDown, ExternalLink, SlidersHorizontal, Newspaper } from "lucide-react"
// import { fetchNews, type NewsArticle } from "@/services/news-service"
import { getArticles, type NewsArticle} from "@/services/flask-service"
import { recordUserFeedback } from "../actions"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useUser } from "@/contexts/user-context"

// Define the category types and their colors
const categoryColors = {
  comfort: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  balanced: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  challenge: {
    bg: "bg-purple-100",
    text: "text-purple-800",
    border: "border-purple-200",
  },
}

// Function to assign a category to an article based on its ID
function assignCategory(articleId: string): "comfort" | "balanced" | "challenge" {
  // Use the first character of the UUID to deterministically assign a category
  const firstChar = articleId.charAt(0)
  const charCode = firstChar.charCodeAt(0)

  if (charCode % 3 === 0) return "comfort"
  if (charCode % 3 === 1) return "balanced"
  return "challenge"
}

export default function FeedPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())
  const [dislikedArticles, setDislikedArticles] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    comfort: true,
    balanced: true,
    challenge: true,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Use our existing user context
  const { user } = useUser()

  // Load articles
  useEffect(() => {
    async function loadArticles() {
      setLoading(true)

      try {
        // Fetch articles from database
        // const newsArticles = await fetchNews()
        const newsArticles = await getArticles(user?.email || "user@example.com")
        setArticles(newsArticles)
        setFilteredArticles(newsArticles)
      } catch (error) {
        console.error("Error loading articles:", error)
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  // Apply filters when they change
  useEffect(() => {
    if (articles.length === 0) return

    const filtered = articles.filter((article) => {
      const category = article.type
      return filters[category]
    })

    setFilteredArticles(filtered)
  }, [filters, articles])

  // Handle like action
  const handleLike = async (article: NewsArticle) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to like articles",
        variant: "destructive",
      })
      return
    }

    // Update UI state
    setLikedArticles((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(article.uuid)) {
        newLiked.delete(article.uuid)
      } else {
        newLiked.add(article.uuid)
      }
      return newLiked
    })

    // Remove from disliked if present
    if (dislikedArticles.has(article.uuid)) {
      setDislikedArticles((prev) => {
        const newDisliked = new Set(prev)
        newDisliked.delete(article.uuid)
        return newDisliked
      })
    }

    // Record feedback to backend
    if (!likedArticles.has(article.uuid)) {
      const category = article.type
      const result = await recordUserFeedback(article, "like", category, user.email)

      if (result.success) {
        toast({
          title: "Article liked",
          description: "Your preferences have been updated",
        })
      }
    }
  }

  // Handle dislike action
  const handleDislike = async (article: NewsArticle) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to dislike articles",
        variant: "destructive",
      })
      return
    }

    // Update UI state
    setDislikedArticles((prev) => {
      const newDisliked = new Set(prev)
      if (newDisliked.has(article.uuid)) {
        newDisliked.delete(article.uuid)
      } else {
        newDisliked.add(article.uuid)
      }
      return newDisliked
    })

    // Remove from liked if present
    if (likedArticles.has(article.uuid)) {
      setLikedArticles((prev) => {
        const newLiked = new Set(prev)
        newLiked.delete(article.uuid)
        return newLiked
      })
    }

    // Record feedback to backend
    if (!dislikedArticles.has(article.uuid)) {
      const category = article.type
      const result = await recordUserFeedback(article, "dislike", category, user.email)

      if (result.success) {
        toast({
          title: "Article disliked",
          description: "Your preferences have been updated",
        })
      }
    }
  }

  // Open article in new tab
  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // Toggle a filter
  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">News Feed</h1>

        <Button variant="outline" className="flex items-center gap-2" onClick={toggleFilterPanel}>
          <SlidersHorizontal size={16} />
          Filter
        </Button>
      </div>

      {/* Simple filter panel that shows/hides */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm">
          <h3 className="font-medium mb-3">Filter by category:</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="filter-comfort"
                checked={filters.comfort}
                onChange={() => toggleFilter("comfort")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="filter-comfort" className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${categoryColors.comfort.bg}`}></div>
                <span>Comfort</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="filter-balanced"
                checked={filters.balanced}
                onChange={() => toggleFilter("balanced")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="filter-balanced" className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${categoryColors.balanced.bg}`}></div>
                <span>Balanced</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="filter-challenge"
                checked={filters.challenge}
                onChange={() => toggleFilter("challenge")}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="filter-challenge" className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${categoryColors.challenge.bg}`}></div>
                <span>Challenge</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found with the selected filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredArticles.map((article) => {
            const category = article.type
            const categoryStyle = categoryColors[category]

            return (
              <Card key={article.uuid} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div onClick={() => openArticle(article.url)} className="cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <Badge className={`${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {article.source} • {new Date(article.published_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  {/* Image section */}
                  <div className="px-6 pb-2">
                    <div className="relative h-48 w-full overflow-hidden rounded-md bg-gray-100">
                      {article.image_url ? (
                        <Image
                          src={article.image_url || "/placeholder.svg"}
                          alt={article.title}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <Newspaper className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent>
                    <p>{article.description || article.snippet}</p>
                  </CardContent>
                </div>
                <CardFooter className="flex justify-between pt-2 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLike(article)
                      }}
                      className={`flex items-center gap-1 ${likedArticles.has(article.uuid) ? "text-green-600" : ""}`}
                    >
                      <Heart
                        className={likedArticles.has(article.uuid) ? "fill-green-500 text-green-500" : ""}
                        size={18}
                      />
                      {likedArticles.has(article.uuid) ? "Liked" : "Like"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDislike(article)
                      }}
                      className={`flex items-center gap-1 ${dislikedArticles.has(article.uuid) ? "text-red-600" : ""}`}
                    >
                      <ThumbsDown
                        className={dislikedArticles.has(article.uuid) ? "fill-red-500 text-red-500" : ""}
                        size={18}
                      />
                      {dislikedArticles.has(article.uuid) ? "Disliked" : "Dislike"}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openArticle(article.url)
                    }}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                    Read More
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
      <Toaster />
    </div>
  )
}
