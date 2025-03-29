"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsDown, ExternalLink } from "lucide-react"
import { fetchNews, mapUserCategoryToApiCategory, type NewsArticle } from "@/services/news-service"
import { recordUserFeedback } from "../actions"
import Image from "next/image"

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("comfort")
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

  useEffect(() => {
    async function loadArticles() {
      // Load articles for all categories
      const categories = ["comfort", "balanced", "challenge"]

      for (const category of categories) {
        setLoading((prev) => ({ ...prev, [category]: true }))
        const apiCategory = mapUserCategoryToApiCategory(category)
        const newsArticles = await fetchNews(apiCategory)

        setArticles((prev) => ({
          ...prev,
          [category]: newsArticles,
        }))
        setLoading((prev) => ({ ...prev, [category]: false }))
      }
    }

    loadArticles()
  }, [])

  const handleLike = async (articleId: string) => {
    // Remove from disliked if it's there
    if (dislikedArticles.has(articleId)) {
      setDislikedArticles((prev) => {
        const newDisliked = new Set(prev)
        newDisliked.delete(articleId)
        return newDisliked
      })
    }

    // Toggle liked status
    setLikedArticles((prev) => {
      const newLiked = new Set(prev)
      if (newLiked.has(articleId)) {
        newLiked.delete(articleId)
      } else {
        newLiked.add(articleId)
      }
      return newLiked
    })

    // Record feedback to backend
    if (!likedArticles.has(articleId)) {
      await recordUserFeedback(articleId, "like")
    }
  }

  const handleDislike = async (articleId: string) => {
    // Remove from liked if it's there
    if (likedArticles.has(articleId)) {
      setLikedArticles((prev) => {
        const newLiked = new Set(prev)
        newLiked.delete(articleId)
        return newLiked
      })
    }

    // Toggle disliked status
    setDislikedArticles((prev) => {
      const newDisliked = new Set(prev)
      if (newDisliked.has(articleId)) {
        newDisliked.delete(articleId)
      } else {
        newDisliked.add(articleId)
      }
      return newDisliked
    })

    // Record feedback to backend
    if (!dislikedArticles.has(articleId)) {
      await recordUserFeedback(articleId, "dislike")
    }
  }

  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
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
              {articles[activeTab].map((article) => (
                <Card key={article.uuid} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div onClick={() => openArticle(article.url)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
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
                          handleLike(article.uuid)
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
                          handleDislike(article.uuid)
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
    </div>
  )
}

