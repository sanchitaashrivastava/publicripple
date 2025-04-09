// app/actions.ts
'use server';

// Optionally import utilities for auth, database, etc.
// import { getCurrentUser } from '@/lib/auth'; // Example: function to get user
// import { db } from '@/lib/db'; // Example: your database client instance
// import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation';

// Define the type for the responses object received from the client
type SurveyResponses = Record<number, "left" | "center" | "right" | null>;

/**
 * Saves the user's survey responses.
 * @param responses - An object where keys are article pair IDs and values are 'left', 'center', 'right', or null.
 */
export async function submitSurveyAction(responses: SurveyResponses) {
  console.log('Server Action: Received survey responses:', responses);

  // --- Placeholder: Replace with your actual logic ---
  try {
    // 1. Get Authenticated User (Example)
    // const user = await getCurrentUser();
    // if (!user || !user.id) {
    //   throw new Error("User not authenticated.");
    // }
    const userId = "placeholder-user-id"; // Replace with actual user ID logic

    // 2. Validate Responses (Optional but recommended)
    // Ensure keys are numbers, values are valid options

    // 3. Prepare data for saving (maybe transform or calculate score server-side)
    const dataToSave = {
        userId: userId,
        surveyData: responses, // Store the raw responses
        // calculatedScore: calculateLeaningScore(responses), // Optionally calculate score here
        submittedAt: new Date(),
    };
    console.log('Server Action: Data prepared for saving:', dataToSave);


    // 4. Save to Database (Example using a hypothetical db client)
    // await db.userProfile.upsert({ // Or update if profile exists
    //   where: { userId: userId },
    //   update: { surveyResponses: responses, lastSurveyDate: new Date() },
    //   create: { userId: userId, surveyResponses: responses, lastSurveyDate: new Date() },
    // });

    // Simulate DB save delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`Server Action: Successfully saved survey for user ${userId}`);

    // Optional: Revalidate relevant paths if data display changes elsewhere
    // revalidatePath('/profile');

    return { success: true }; // Indicate success back to the client if needed

  } catch (error) {
    console.error("Server Action Error: Failed to submit survey:", error);
    // Return a more specific error or throw to be caught client-side
    // throw new Error("Failed to save survey preferences."); // This will be caught by the client's catch block
     return { success: false, error: "Failed to save preferences on server." }; // Or return error object
  }
  // --- End Placeholder ---
}


// Existing function from user input - kept as is
export async function recordUserFeedback(articleId: string, feedback: "like" | "dislike") {
  try {
    // In a real application, you would store this in a database
    // For now, we'll just log it to the console
    console.log(`User feedback recorded: ${feedback} for article ${articleId}`)

    // Simulate a successful API call
    return { success: true }
  } catch (error) {
    console.error("Error recording user feedback:", error)
    return { success: false, error: "Failed to record feedback" }
  }
}

// Helper function to calculate score (can be used server-side too)
// const calculateLeaningScore = (submittedResponses: SurveyResponses) => {
//      return Object.values(submittedResponses).reduce((score, response) => {
//        if (response === "left") return score - 1;
//        if (response === "right") return score + 1;
//        return score;
//      }, 0);
// }