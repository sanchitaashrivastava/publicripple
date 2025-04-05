import dotenv from "dotenv";
dotenv.config();

export interface NewsArticle {
  uuid: string
  title: string
  description: string
  snippet: string
  url: string
  image_url: string | null
  published_at: string
  source: string
  categories: string[]
  relevance_score: number | null
  locale: string
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

export async function fetchNews(category = ""): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    console.log("Environment Variables:", process.env);
    console.log("API Key:", apiKey) // Log the API key for debugging purposes
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

// Map user preference categories to API categories
export function mapUserCategoryToApiCategory(userCategory: string): string {
  const categoryMap: Record<string, string> = {
    comfort: "politics",
    balanced: "general",
    challenge: "tech",
  }

  return categoryMap[userCategory] || "general"
}

