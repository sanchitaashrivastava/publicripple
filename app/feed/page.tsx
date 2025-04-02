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
        setLoading(prev => ({ ...prev, [category]: true }))
        const apiCategory = mapUserCategoryToApiCategory(category)
        const newsArticles = await fetchNews(apiCategory)
        
        setArticles(prev => ({
          ...prev,
          [category]: newsArticles,
        }))
        setLoading(prev => ({ ...prev, [category]: false }))
      }
    }

    loadArticles()
  }, [])

  const handleLike = async (articleUrl: string) => {
    setDislikedArticles(prev => new Set([...prev].filter(url => url !== articleUrl)))
    setLikedArticles(prev => {
      const newLiked = new Set(prev)
      newLiked.has(articleUrl) ? newLiked.delete(articleUrl) : newLiked.add(articleUrl)
      return newLiked
    })
    if (!likedArticles.has(articleUrl)) {
      await recordUserFeedback(articleUrl, "like")
    }
  }

  const handleDislike = async (articleUrl: string) => {
    setLikedArticles(prev => new Set([...prev].filter(url => url !== articleUrl)))
    setDislikedArticles(prev => {
      const newDisliked = new Set(prev)
      newDisliked.has(articleUrl) ? newDisliked.delete(articleUrl) : newDisliked.add(articleUrl)
      return newDisliked
    })
    if (!dislikedArticles.has(articleUrl)) {
      await recordUserFeedback(articleUrl, "dislike")
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
              {articles[activeTab].map(article => (
                <Card key={article.url} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div onClick={() => openArticle(article.url)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    {article.urlToImage && (
                      <div className="px-6 pb-2">
                        <div className="relative h-48 w-full overflow-hidden rounded-md">
                          <Image
                            src={article.urlToImage}
                            alt={article.title}
                            fill
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <CardContent>
                      <p>{article.description || article.content?.substring(0, 100)}</p>
                    </CardContent>
                  </div>
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(article.url)
                        }}
                        className={`flex items-center gap-1 ${likedArticles.has(article.url) ? "text-green-600" : ""}`}
                      >
                        <Heart
                          className={likedArticles.has(article.url) ? "fill-green-500 text-green-500" : ""}
                          size={18}
                        />
                        {likedArticles.has(article.url) ? "Liked" : "Like"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDislike(article.url)
                        }}
                        className={`flex items-center gap-1 ${dislikedArticles.has(article.url) ? "text-red-600" : ""}`}
                      >
                        <ThumbsDown
                          className={dislikedArticles.has(article.url) ? "fill-red-500 text-red-500" : ""}
                          size={18}
                        />
                        {dislikedArticles.has(article.url) ? "Disliked" : "Dislike"}
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

