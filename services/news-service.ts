import { supabase, isSupabaseConfigured } from "@/lib/supabase"

export interface NewsArticle {
  uuid: string // Maps to id in the database
  title: string // Maps to headline in the database
  description: string // Maps to abstract in the database
  snippet: string // Also maps to abstract
  url: string
  image_url: string | null // Not in the database, will be null
  published_at: string // Maps to article_date
  source: string
  categories: string[] // Not in the database, will be empty array
  relevance_score: number | null // Not in the database, will be null
  locale: string // Not in the database, will be "us"
}

export interface NewsResponse {
  meta: {
    found: number
    returned: number
    limit: number
    page: number
  }
  data: NewsArticle[]
}

// USING API
/*
export async function fetchNews(category = ""): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY
    let url = `https://api.thenewsapi.com/v1/news/top?api_token=${apiKey}&locale=us&limit=10`

    // Add category if provided
    if (category) {
      url += `&categories=${category}`
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: NewsResponse = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}
*/

// New function to fetch articles from the database
export async function fetchNews(category = ""): Promise<NewsArticle[]> {
  try {
    if (!isSupabaseConfigured()) {
      // Return mock data if Supabase is not configured
      return getMockArticles()
    }

    // Fetch articles from the database
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("article_date", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching articles from database:", error)
      return []
    }

    // Map database articles to NewsArticle format
    return data.map((article) => ({
      uuid: article.id,
      title: article.headline,
      description: article.abstract || "",
      snippet: article.abstract || "",
      url: article.url,
      image_url: article.image_url, // No image in the database
      published_at: article.article_date || article.date_added,
      source: article.source,
      categories: [], // No categories in the database
      relevance_score: null,
      locale: "us",
    }))
  } catch (error) {
    console.error("Error fetching news from database:", error)
    return []
  }
}

// Mock articles for local development
function getMockArticles(): NewsArticle[] {
  return [
    {
      uuid: "1",
      title: "Sample Article 1",
      description: "This is a sample article description for testing purposes.",
      snippet: "This is a sample article snippet.",
      url: "https://example.com/article1",
      image_url: null,
      published_at: new Date().toISOString(),
      source: "Sample Source",
      categories: [],
      relevance_score: null,
      locale: "us",
    },
    {
      uuid: "2",
      title: "Sample Article 2",
      description: "Another sample article description for testing.",
      snippet: "Another sample article snippet.",
      url: "https://example.com/article2",
      image_url: null,
      published_at: new Date().toISOString(),
      source: "Sample Source",
      categories: [],
      relevance_score: null,
      locale: "us",
    },
  ]
}

// USING API
/*
// Map user preference categories to API categories
export function mapUserCategoryToApiCategory(userCategory: string): string {
  const categoryMap: Record<string, string> = {
    comfort: "politics",
    balanced: "general",
    challenge: "opinion",
  }

  return categoryMap[userCategory] || "general"
}
*/

// New function that doesn't map to API categories since we're showing all articles
export function mapUserCategoryToApiCategory(userCategory: string): string {
  // No mapping needed anymore, but keeping the function for compatibility
  return ""
}
