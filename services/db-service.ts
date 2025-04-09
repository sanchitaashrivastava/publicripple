import { supabase, isSupabaseConfigured } from "@/lib/supabase"

// Type definitions for our database tables
export interface User {
  email: string
  password?: string
}

export interface SurveyResponse {
  email: string
  q1: boolean
  q2: boolean
  q3: boolean
  q4: boolean
  q5: boolean
}

export interface ArticleFeedback {
  id?: number
  email: string
  flag: string
  article_id: string
  likes?: boolean
}

// Fallback to localStorage if Supabase is not configured
const useLocalStorageFallback = !isSupabaseConfigured()

// User management functions
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return null
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      return users[email] || null
    }

    // Query Supabase - using "userdata" table
    const { data, error } = await supabase.from("userdata").select("*").eq("email", email).maybeSingle()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    return null
  }
}

export async function createUser(email: string, password: string): Promise<User | null> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return null
      const storedUsers = localStorage.getItem("users")
      const users = storedUsers ? JSON.parse(storedUsers) : {}

      const newUser = { email, password }
      users[email] = newUser

      localStorage.setItem("users", JSON.stringify(users))
      return newUser
    }

    // Store user in the "userdata" table
    const { data, error } = await supabase.from("userdata").insert([{ email, password }]).select().single()

    if (error) {
      console.error("Error creating user record:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createUser:", error)
    return null
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      const user = await getUserByEmail(email)
      // In a real app, you would hash and verify the password
      if (user && (user as any).password === password) {
        return user
      }
      return null
    }

    // Get user from the "userdata" table and check password
    const { data, error } = await supabase
      .from("userdata")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle()

    if (error) {
      console.error("Error fetching user during login:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in loginUser:", error)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  // No action needed for Supabase when using simple password auth
  // No action needed for localStorage fallback
}

// Check if user has completed the survey
export async function hasCompletedSurvey(email: string): Promise<boolean> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return false
      const storedResponses = localStorage.getItem("surveyResponses")
      const responses = storedResponses ? JSON.parse(storedResponses) : {}
      return !!responses[email]
    }

    // Check if user has survey responses
    const { data, error } = await supabase.from("survey_responses").select("email").eq("email", email).maybeSingle()

    if (error) {
      console.error("Error checking survey completion:", error)
      return false
    }

    return !!data
  } catch (error) {
    console.error("Error in hasCompletedSurvey:", error)
    return false
  }
}

// Survey response functions
export async function getSurveyResponses(email: string): Promise<Record<string, boolean> | null> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return null
      const storedResponses = localStorage.getItem("surveyResponses")
      const responses = storedResponses ? JSON.parse(storedResponses) : {}

      // Return null if no responses exist for this email
      return responses[email] || null
    }

    // Query the survey_responses table directly using email
    const { data, error } = await supabase.from("survey_responses").select("*").eq("email", email).maybeSingle()

    if (error) {
      console.error("Error fetching survey responses:", error)
      return null
    }

    if (!data) {
      // Return null if no responses found
      return null
    }

    return {
      q1: data.q1,
      q2: data.q2,
      q3: data.q3,
      q4: data.q4,
      q5: data.q5,
    }
  } catch (error) {
    console.error("Error in getSurveyResponses:", error)
    return null
  }
}

export async function updateSurveyResponses(
  email: string,
  responses: Record<number, boolean>,
): Promise<Record<string, boolean> | null> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return null
      const storedResponses = localStorage.getItem("surveyResponses")
      const allResponses = storedResponses ? JSON.parse(storedResponses) : {}

      // Format responses for storage
      allResponses[email] = {
        q1: responses[0],
        q2: responses[1],
        q3: responses[2],
        q4: responses[3],
        q5: responses[4],
      }

      localStorage.setItem("surveyResponses", JSON.stringify(allResponses))
      return allResponses[email]
    }

    // Format responses for database - using email directly
    // Removed updated_at field since it doesn't exist in the schema
    const formattedResponses = {
      email: email,
      q1: responses[0],
      q2: responses[1],
      q3: responses[2],
      q4: responses[3],
      q5: responses[4],
    }

    // Check if responses already exist by email
    const { data: existingData, error: checkError } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing survey responses:", checkError)
      return null
    }

    let result
    if (existingData) {
      // Update existing responses using email as the condition
      const { data, error } = await supabase
        .from("survey_responses")
        .update(formattedResponses)
        .eq("email", email)
        .select()
        .single()

      if (error) {
        console.error("Error updating survey responses:", error)
        return null
      }
      result = data
    } else {
      // Insert new responses
      const { data, error } = await supabase.from("survey_responses").insert([formattedResponses]).select().single()

      if (error) {
        console.error("Error inserting survey responses:", error)
        return null
      }
      result = data
    }

    return {
      q1: result.q1,
      q2: result.q2,
      q3: result.q3,
      q4: result.q4,
      q5: result.q5,
    }
  } catch (error) {
    console.error("Error in updateSurveyResponses:", error)
    return null
  }
}

// Article feedback functions
export async function recordArticleFeedback(
  email: string,
  articleId: string,
  feedback: "like" | "dislike",
  category: string,
): Promise<boolean> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return false
      const storedFeedback = localStorage.getItem("articleFeedback")
      const allFeedback = storedFeedback ? JSON.parse(storedFeedback) : []

      // Add new feedback
      allFeedback.push({
        email,
        article_id: articleId,
        feedback,
        category,
        created_at: new Date().toISOString(),
      })

      localStorage.setItem("articleFeedback", JSON.stringify(allFeedback))
      return true
    }

    // Check if feedback already exists
    const { data: existingData, error: checkError } = await supabase
      .from("feed")
      .select("id, likes")
      .eq("email", email)
      .eq("article_id", articleId)
      .eq("flag", category)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing feedback:", checkError)
      return false
    }

    const likes = feedback === "like"

    if (existingData) {
      // Update existing feedback if it's different
      if (existingData.likes !== likes) {
        const { error } = await supabase.from("feed").update({ likes }).eq("id", existingData.id)

        if (error) {
          console.error("Error updating article feedback:", error)
          return false
        }
      }
    } else {
      // Insert new feedback
      const { error } = await supabase.from("feed").insert([
        {
          email: email,
          article_id: articleId,
          flag: category,
          likes: likes,
        },
      ])

      if (error) {
        console.error("Error inserting article feedback:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error in recordArticleFeedback:", error)
    return false
  }
}

export async function getUserArticleFeedback(email: string): Promise<Record<string, "like" | "dislike">> {
  try {
    if (useLocalStorageFallback) {
      // Fallback to localStorage
      if (typeof window === "undefined") return {}
      const storedFeedback = localStorage.getItem("articleFeedback")
      const allFeedback = storedFeedback ? JSON.parse(storedFeedback) : []

      // Filter feedback for this user and convert to record
      const userFeedback: Record<string, "like" | "dislike"> = {}
      allFeedback
        .filter((item: any) => item.email === email)
        .forEach((item: any) => {
          userFeedback[item.article_id] = item.feedback
        })

      return userFeedback
    }

    // Get all feedback for this user
    const { data, error } = await supabase
      .from("feed")
      .select("article_id, likes")
      .eq("email", email)
      .not("likes", "is", null)

    if (error) {
      console.error("Error fetching user article feedback:", error)
      return {}
    }

    // Convert to record
    const feedbackRecord: Record<string, "like" | "dislike"> = {}
    data.forEach((item) => {
      feedbackRecord[item.article_id] = item.likes ? "like" : "dislike"
    })

    return feedbackRecord
  } catch (error) {
    console.error("Error in getUserArticleFeedback:", error)
    return {}
  }
}
