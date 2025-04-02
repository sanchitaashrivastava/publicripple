export interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
  content: string
}

export async function fetchNews(category = "general"): Promise<NewsArticle[]> {
  try {
    const response = await fetch(`/api/news?category=${category}`)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export function mapUserCategoryToApiCategory(userCategory: string): string {
  const categoryMap: Record<string, string> = {
    comfort: "entertainment",
    balanced: "general",
    challenge: "technology"
  };
  return categoryMap[userCategory] || "general";
}