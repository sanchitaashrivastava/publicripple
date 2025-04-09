import type { NewsArticle } from "./news-service"

// Define types for user preferences
interface UserPreferences {
  likedArticles: Record<string, string[]> // category -> article IDs
  dislikedArticles: Record<string, string[]> // category -> article IDs
  likedKeywords: Record<string, Record<string, number>> // category -> keyword -> weight
  likedSources: Record<string, Record<string, number>> // category -> source -> weight
  dislikedKeywords: Record<string, Record<string, number>> // category -> keyword -> weight
  dislikedSources: Record<string, Record<string, number>> // category -> source -> weight
  lastUpdated: number
}

// Initialize empty preferences
const defaultPreferences: UserPreferences = {
  likedArticles: { comfort: [], balanced: [], challenge: [] },
  dislikedArticles: { comfort: [], balanced: [], challenge: [] },
  likedKeywords: { comfort: {}, balanced: {}, challenge: {} },
  likedSources: { comfort: {}, balanced: {}, challenge: {} },
  dislikedKeywords: { comfort: {}, balanced: {}, challenge: {} },
  dislikedSources: { comfort: {}, balanced: {}, challenge: {} },
  lastUpdated: Date.now(),
}

// Load user preferences from localStorage
export function loadUserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return defaultPreferences
  }

  const storedPreferences = localStorage.getItem("userPreferences")
  if (!storedPreferences) {
    return defaultPreferences
  }

  try {
    return JSON.parse(storedPreferences)
  } catch (error) {
    console.error("Error parsing stored preferences:", error)
    return defaultPreferences
  }
}

// Save user preferences to localStorage
export function saveUserPreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(
    "userPreferences",
    JSON.stringify({
      ...preferences,
      lastUpdated: Date.now(),
    }),
  )
}

// Extract keywords from article title and description
function extractKeywords(article: NewsArticle): string[] {
  // Combine title and description
  const text = `${article.title} ${article.description || ""} ${article.snippet || ""}`.toLowerCase()

  // Remove common stop words and punctuation
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "from",
  ]
  const words = text.split(/\W+/).filter((word) => word.length > 3 && !stopWords.includes(word))

  // Return unique keywords
  return Array.from(new Set(words))
}

// Update preferences based on user feedback
export function updatePreferences(
  article: NewsArticle,
  action: "like" | "dislike",
  category: string,
  preferences: UserPreferences = loadUserPreferences(),
): UserPreferences {
  const newPreferences = { ...preferences }
  const keywords = extractKeywords(article)
  const source = article.source.toLowerCase()

  // Update article lists
  if (action === "like") {
    // Add to liked articles
    if (!newPreferences.likedArticles[category].includes(article.uuid)) {
      newPreferences.likedArticles[category].push(article.uuid)
    }

    // Remove from disliked if present
    newPreferences.dislikedArticles[category] = newPreferences.dislikedArticles[category].filter(
      (id) => id !== article.uuid,
    )

    // Update keyword weights
    if (!newPreferences.likedKeywords[category]) {
      newPreferences.likedKeywords[category] = {}
    }

    keywords.forEach((keyword) => {
      newPreferences.likedKeywords[category][keyword] = (newPreferences.likedKeywords[category][keyword] || 0) + 1
    })

    // Update source weights
    if (!newPreferences.likedSources[category]) {
      newPreferences.likedSources[category] = {}
    }

    newPreferences.likedSources[category][source] = (newPreferences.likedSources[category][source] || 0) + 1
  } else {
    // Add to disliked articles
    if (!newPreferences.dislikedArticles[category].includes(article.uuid)) {
      newPreferences.dislikedArticles[category].push(article.uuid)
    }

    // Remove from liked if present
    newPreferences.likedArticles[category] = newPreferences.likedArticles[category].filter((id) => id !== article.uuid)

    // Update keyword weights
    if (!newPreferences.dislikedKeywords[category]) {
      newPreferences.dislikedKeywords[category] = {}
    }

    keywords.forEach((keyword) => {
      newPreferences.dislikedKeywords[category][keyword] = (newPreferences.dislikedKeywords[category][keyword] || 0) + 1
    })

    // Update source weights
    if (!newPreferences.dislikedSources[category]) {
      newPreferences.dislikedSources[category] = {}
    }

    newPreferences.dislikedSources[category][source] = (newPreferences.dislikedSources[category][source] || 0) + 1
  }

  // Save updated preferences
  saveUserPreferences(newPreferences)

  return newPreferences
}

// Calculate article score based on user preferences
export function calculateArticleScore(
  article: NewsArticle,
  category: string,
  preferences: UserPreferences = loadUserPreferences(),
): number {
  // Start with a neutral score
  let score = 50

  // Check if already liked or disliked
  if (preferences.likedArticles[category].includes(article.uuid)) {
    return 100 // Maximum score for already liked articles
  }

  if (preferences.dislikedArticles[category].includes(article.uuid)) {
    return 0 // Minimum score for already disliked articles
  }

  // Extract keywords from the article
  const keywords = extractKeywords(article)
  const source = article.source.toLowerCase()

  // Adjust score based on keywords - make this more impactful
  keywords.forEach((keyword) => {
    // Positive adjustment for liked keywords (increased from 2 to 5)
    if (preferences.likedKeywords[category][keyword]) {
      score += preferences.likedKeywords[category][keyword] * 5
    }

    // Negative adjustment for disliked keywords (increased from 2 to 5)
    if (preferences.dislikedKeywords[category][keyword]) {
      score -= preferences.dislikedKeywords[category][keyword] * 5
    }
  })

  // Adjust score based on source - make this more impactful
  if (preferences.likedSources[category][source]) {
    score += preferences.likedSources[category][source] * 10 // Increased from 5 to 10
  }

  if (preferences.dislikedSources[category][source]) {
    score -= preferences.dislikedSources[category][source] * 10 // Increased from 5 to 10
  }

  // Add randomization factor to create more visible changes
  score += Math.random() * 10 - 5 // Add -5 to +5 random adjustment

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score))
}

// Sort articles based on user preferences
export function sortArticlesByPreference(
  articles: NewsArticle[],
  category: string,
  preferences: UserPreferences = loadUserPreferences(),
): NewsArticle[] {
  // If no preferences exist yet, add some randomization
  const hasPreferences =
    preferences.likedArticles[category].length > 0 || preferences.dislikedArticles[category].length > 0

  if (!hasPreferences) {
    // If no preferences yet, just shuffle the articles slightly
    return [...articles].sort(() => Math.random() - 0.5)
  }

  // Calculate scores for each article
  const articlesWithScores = articles.map((article) => {
    const score = calculateArticleScore(article, category, preferences)
    console.log(`Article "${article.title.substring(0, 30)}..." score: ${score.toFixed(2)}`)
    return {
      article,
      score,
    }
  })

  // Sort by score (highest first)
  return articlesWithScores.sort((a, b) => b.score - a.score).map((item) => item.article)
}
