/**
 * Flask API Service
 * 
 * Service for interacting with the Flask backend API
 */

// Define the interfaces for the news article data
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
    type: "comfort" | "balanced" | "challenge"
}

interface APIArticle {
    abstract: string
    article_date: string
    date_added: string
    headline: string
    id: string
    image_url: string
    source: string
    url: string
    type: "comfort" | "balanced" | "challenge"
}


const apiBaseUrl: string = 'http://127.0.0.1:5000/api';

/**
 * Fetch news articles from the Flask API
 * 
 * @param email - User email for personalization
 * @param flag - Flag parameter to filter articles (e.g., 'recommended', 'trending', etc.)
 * @returns Promise with NewsResponse containing articles
 */
export async function getArticles(email: string): Promise<NewsArticle[]> {
    try {
    // Encode parameters to handle special characters
    const encodedEmail = encodeURIComponent(email);
    
    // Construct the URL with query parameters
    const url = `${apiBaseUrl}/articles/labeled?email=${encodedEmail}&limit=10`;
    
    // Make the GET request
    const response = await fetch(url, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        }
    });
    
    // Check if request was successful
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the JSON response
    const newsResponse: APIArticle[] = await response.json();
    return newsResponse.map((article) => ({
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
        type: article.type
    }))
    
    } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
    }
}