"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsDown, ExternalLink, RefreshCw, BadgeCheck } from 'lucide-react'
import { fetchNews, mapUserCategoryToApiCategory, type NewsArticle } from "@/services/news-service"
import { recordUserFeedback } from "../actions"
import Image from "next/image"
import { loadUserPreferences, updatePreferences, sortArticlesByPreference } from "@/services/recommendation-service"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useUser } from "@/contexts/user-context" // Use our existing user context

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("comfort")
  const [originalArticles, setOriginalArticles] = useState<Record<string, NewsArticle[]>>({
    comfort: [],
    balanced: [],
    challenge: [],
  })
  const [articles, setArticles] = useState<Record<string, NewsArticle[]>>({
    comfort: [],
    balanced: [],
    challenge: [],
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({
    comfort: true,
    balanced: true,
    challenge: true,
  })
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())
  const [dislikedArticles, setDislikedArticles] = useState<Set<string>>(new Set())
  const [preferences, setPreferences] = useState(loadUserPreferences())
  const [isRecommended, setIsRecommended] = useState<Record<string, boolean>>({
    comfort: false,
    balanced: false,
    challenge: false,
  })

  // Use our existing user context instead of next-auth
  const { user } = useUser()

  // Load user preferences and liked/disliked articles on mount
  useEffect(() => {
    const prefs = loadUserPreferences()
    setPreferences(prefs)

    // Initialize liked and disliked sets from preferences
    const liked = new Set<string>()
    const disliked = new Set<string>()

    Object.values(prefs.likedArticles).forEach((ids) => {
      ids.forEach((id) => liked.add(id))
    })

    Object.values(prefs.dislikedArticles).forEach((ids) => {
      ids.forEach((id) => disliked.add(id))
    })

    setLikedArticles(liked)
    setDislikedArticles(disliked)
  }, [])

  // Load articles for all categories
  useEffect(() => {
    async function loadArticles() {
      const categories = ["comfort", "balanced", "challenge"]

      for (const category of categories) {
        setLoading((prev) => ({ ...prev, [category]: true }))
        const apiCategory = mapUserCategoryToApiCategory(category)
        const newsArticles = await fetchNews(apiCategory)

        setOriginalArticles((prev) => ({
          ...prev,
          [category]: newsArticles,
        }))

        setArticles((prev) => ({
          ...prev,
          [category]: newsArticles,
        }))

        setLoading((prev) => ({ ...prev, [category]: false }))
      }
    }

    loadArticles()
  }, [])

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
      const result = await recordUserFeedback(article, "like", activeTab, user.email)

      if (result.success) {
        // Update preferences with the new feedback
        const newPreferences = updatePreferences(article, "like", activeTab, preferences)
        setPreferences(newPreferences)

        toast({
          title: "Article liked",
          description: "Your preferences have been updated",
        })

        // If recommendations are already applied, update the sorting
        if (isRecommended[activeTab]) {
          applyRecommendations()
        }
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
      const result = await recordUserFeedback(article, "dislike", activeTab, user.email)

      if (result.success) {
        // Update preferences with the new feedback
        const newPreferences = updatePreferences(article, "dislike", activeTab, preferences)
        setPreferences(newPreferences)

        toast({
          title: "Article disliked",
          description: "Your preferences have been updated",
        })

        // If recommendations are already applied, update the sorting
        if (isRecommended[activeTab]) {
          applyRecommendations()
        }
      }
    }
  }

  // Open article in new tab
  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  // Apply recommendations to current tab
  const applyRecommendations = () => {
    if (articles[activeTab].length === 0) return

    console.log("Applying recommendations for", activeTab)
    console.log(
      "Original order:",
      articles[activeTab].map((a) => a.title.substring(0, 20)),
    )

    const sortedArticles = sortArticlesByPreference([...articles[activeTab]], activeTab, preferences)

    console.log(
      "New order:",
      sortedArticles.map((a) => a.title.substring(0, 20)),
    )

    // Check if the order actually changed
    const orderChanged =
      JSON.stringify(sortedArticles.map((a) => a.uuid)) !== JSON.stringify(articles[activeTab].map((a) => a.uuid))

    setArticles((prev) => ({
      ...prev,
      [activeTab]: sortedArticles,
    }))

    setIsRecommended((prev) => ({
      ...prev,
      [activeTab]: true,
    }))

    toast({
      title: orderChanged ? "Recommendations applied" : "No significant changes",
      description: orderChanged
        ? "Articles have been reordered based on your preferences"
        : "Like or dislike more articles to see changes",
    })
  }

  // Reset recommendations for current tab
  const resetRecommendations = async () => {
    setLoading((prev) => ({ ...prev, [activeTab]: true }))

    // Restore original order
    setArticles((prev) => ({
      ...prev,
      [activeTab]: [...originalArticles[activeTab]],
    }))

    setIsRecommended((prev) => ({
      ...prev,
      [activeTab]: false,
    }))

    setLoading((prev) => ({ ...prev, [activeTab]: false }))

    toast({
      title: "Reset to default order",
      description: "Articles are now shown in their original order",
    })
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Your News Feed</h1>
      <Tabs defaultValue="comfort" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comfort">Comfort</TabsTrigger>
          <TabsTrigger value="balanced">Balanced</TabsTrigger>
          <TabsTrigger value="challenge">Challenge</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            {isRecommended[activeTab] ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Personalized recommendations active
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                Default order
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!isRecommended[activeTab] ? (
              <Button
                variant="outline"
                size="sm"
                onClick={applyRecommendations}
                disabled={loading[activeTab] || articles[activeTab].length === 0}
                className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800"
              >
                Apply Recommendations
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={resetRecommendations} disabled={loading[activeTab]}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
            )}
          </div>
        </div>

        <TabsContent value={activeTab}>
          {loading[activeTab] ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : articles[activeTab].length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found for this category.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {articles[activeTab].map((article, index) => (
                <Card
                  key={article.uuid}
                  className={`overflow-hidden hover:shadow-lg transition-shadow ${
                    isRecommended[activeTab] && index === 0 ? "border-green-300 shadow-md" : ""
                  }`}
                >
                  <div onClick={() => openArticle(article.url)} className="cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        {isRecommended[activeTab] && index === 0 && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Top Pick</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {article.source} • {new Date(article.published_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    {article.image_url && (
                      <div className="px-6 pb-2">
                        <div className="relative h-48 w-full overflow-hidden rounded-md">
                          <Image
                            src={article.image_url || "/placeholder.svg"}
                            alt={article.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                    )}
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
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}
