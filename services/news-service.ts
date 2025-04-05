// News article structure
export interface NewsArticle {
  uuid: string       // Unique ID like a book ISBN
  title: string      // Headline
  description: string // Short summary
  url: string        // Link to full article
  image_url: string  // News image URL
  published_at: string // Date published
  source: string     // News outlet name
}

// Get news for a category
export async function fetchNews(category: string): Promise<NewsArticle[]> {
  try {
    // 1. Build API URL (like a library catalog search)
    const url = `https://api.thenewsapi.com/v1/news/top?api_token=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&categories=${category}&locale=us&limit=10`;

    // 2. Fetch news
    const response = await fetch(url);
    
    // 3. Check for errors
    if (!response.ok) {
      throw new Error(`News error: ${response.status}`);
    }

    // 4. Convert to JSON
    const data = await response.json();

    // 5. Clean up data
    return data.data.map((article: any) => ({
      uuid: article.uuid,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      published_at: article.published_at,
      source: article.source
    }));
    
  } catch (error) {
    console.error("News machine broken:", error);
    return [];
  }
}

// Map our categories to API categories
export function mapUserCategoryToApiCategory(userCategory: string): string {
  const categoryMap: Record<string, string> = {
    comfort: "politics",    // Familiar topics
    balanced: "business",   // Neutral
    challenge: "technology" // New perspectives
  };
  return categoryMap[userCategory] || "general";
}