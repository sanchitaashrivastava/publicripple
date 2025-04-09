"use server"

import type { NewsArticle } from "@/services/news-service"
import { recordArticleFeedback } from "@/services/db-service"

export async function recordUserFeedback(
  article: NewsArticle,
  feedback: "like" | "dislike",
  category: string,
  email: string,
) {
  try {
    // Store feedback in database
    const success = await recordArticleFeedback(email, article.uuid, feedback, category)

    if (!success) {
      throw new Error("Failed to record feedback")
    }

    return {
      success: true,
      article,
      feedback,
      category,
    }
  } catch (error) {
    console.error("Error recording user feedback:", error)
    return {
      success: false,
      error: "Failed to record feedback",
    }
  }
}
