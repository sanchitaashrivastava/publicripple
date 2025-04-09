"use client"

// Import necessary libraries and components
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsDown, ExternalLink } from "lucide-react"
import { fetchNews, mapUserCategoryToApiCategory, type NewsArticle } from "@/services/news-service"
import { recordUserFeedback } from "../actions"
import Image from "next/image"

export default function FeedPage() {
  // State management for different parts of the component
  const [activeTab, setActiveTab] = useState("comfort") // Currently selected tab
  const [articles, setArticles] = useState<Record<string, NewsArticle[]>>({
    comfort: [],    // Articles for comfort zone
    balanced: [],   // Balanced perspective articles
    challenge: []   // Challenging viewpoint articles
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({
    comfort: true,    // Loading state for each category
    balanced: true,
    challenge: true
  })
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())    // Track liked articles
  const [dislikedArticles, setDislikedArticles] = useState<Set<string>>(new Set()) // Track disliked articles

  // Load articles when component first mounts
  useEffect(() => {
    async function loadArticles() {
      // Define our three content categories
      const categories = ["comfort", "balanced", "challenge"]

      // Inside the useEffect hook within the loadArticles function:
      for (const category of categories) {
        setLoading(prev => ({ ...prev, [category]: true }))

        const apiCategory = mapUserCategoryToApiCategory(category);
        // --- Add Logging Here ---
        if (category === 'challenge') {
          console.log(`[Feed Debug] Mapped API category/params for 'challenge':`, apiCategory);
        }
        // -----------------------

        const newsArticles = await fetchNews(apiCategory);
        // --- Add Logging Here ---
        if (category === 'challenge') {
          console.log(`[Feed Debug] Fetched articles for 'challenge' (${JSON.stringify(apiCategory)}):`, newsArticles);
        }
        // -----------------------

        setArticles(prev => ({
          ...prev,
          [category]: newsArticles,
        }))

        setLoading(prev => ({ ...prev, [category]: false }))
      }
    }

    loadArticles()
  }, []) // Empty array means this runs once on component mount

  // Handle liking an article
  const handleLike = async (articleId: string) => {
    // Remove from disliked if present
    setDislikedArticles(prev => new Set([...prev].filter(id => id !== articleId)))
    
    // Toggle like status
    setLikedArticles(prev => {
      const newLiked = new Set(prev)
      newLiked.has(articleId) ? newLiked.delete(articleId) : newLiked.add(articleId)
      return newLiked
    })

    // Send feedback to backend if new like
    if (!likedArticles.has(articleId)) {
      await recordUserFeedback(articleId, "like")
    }
  }

  // Handle disliking an article (mirror of like functionality)
  const handleDislike = async (articleId: string) => {
    // Remove from liked if present
    setLikedArticles(prev => new Set([...prev].filter(id => id !== articleId)))
    
    // Toggle dislike status
    setDislikedArticles(prev => {
      const newDisliked = new Set(prev)
      newDisliked.has(articleId) ? newDisliked.delete(articleId) : newDisliked.add(articleId)
      return newDisliked
    })

    // Send feedback to backend if new dislike
    if (!dislikedArticles.has(articleId)) {
      await recordUserFeedback(articleId, "dislike")
    }
  }

  // Open article in new tab
  const openArticle = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Personalized News Feed</h1>
      
      {/* Tabbed interface for different content categories */}
      <Tabs defaultValue="comfort" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comfort">Comfort Zone</TabsTrigger>
          <TabsTrigger value="balanced">Balanced View</TabsTrigger>
          <TabsTrigger value="challenge">Challenge Me</TabsTrigger>
        </TabsList>

        {/* Content for active tab */}
        <TabsContent value={activeTab}>
          {loading[activeTab] ? ( // Show loading spinner
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : articles[activeTab].length === 0 ? ( // No articles found
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found for this category.</p>
            </div>
          ) : ( // Display articles
            <div className="grid gap-4">
              {articles[activeTab].map(article => (
                <Card 
                  key={article.uuid} // Unique identifier from The News API
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Clickable area to open article */}
                  <div onClick={() => openArticle(article.url)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {/* Display source and publication date */}
                        {article.source} • {new Date(article.published_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>

                    {/* Article image with error handling */}
                    {article.image_url && (
                      <div className="px-6 pb-2">
                        <div className="relative h-48 w-full overflow-hidden rounded-md">
                          <Image
                            src={article.image_url}
                            alt={article.title}
                            fill
                            style={{ objectFit: "cover" }}
                            onError={(e) => {
                              // Show placeholder if image fails to load
                              (e.target as HTMLImageElement).src = "/placeholder.svg"
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Article description/content */}
                    <CardContent>
                      <p>{article.description || article.snippet}</p>
                    </CardContent>
                  </div>

                  {/* Action buttons at bottom of card */}
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      {/* Like button */}
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

                      {/* Dislike button */}
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

                    {/* Read more button */}
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