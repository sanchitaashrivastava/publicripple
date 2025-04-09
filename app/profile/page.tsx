"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSurveyResponses, updateSurveyResponses } from "@/services/db-service"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

const surveyQuestions = [
  "I prefer to see content that aligns with my political beliefs",
  "I am comfortable engaging with political views that differ from my own",
  "I would rather avoid political content altogether",
  "I enjoy reading about social issues, even if the content challenges my beliefs",
  "I prefer news sources that present multiple perspectives on issues",
]

export default function ProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [surveyResponses, setSurveyResponses] = useState<Record<string, boolean>>({
    q1: false,
    q2: false,
    q3: false,
    q4: false,
    q5: false,
  })

  useEffect(() => {
    async function loadUserData() {
      if (!user) return

      try {
        setLoading(true)
        const responses = await getSurveyResponses(user.email)

        if (responses) {
          setSurveyResponses(responses)
        }
      } catch (error) {
        console.error("Error loading survey responses:", error)
        toast({
          title: "Error",
          description: "Failed to load your survey responses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  const handleSurveyChange = (question: string, value: boolean) => {
    setSurveyResponses((prev) => ({
      ...prev,
      [question]: value,
    }))
  }

  const handleSaveSurvey = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Convert to the format expected by the server
      const responsesForServer = {
        0: surveyResponses.q1,
        1: surveyResponses.q2,
        2: surveyResponses.q3,
        3: surveyResponses.q4,
        4: surveyResponses.q5,
      }

      console.log("Saving updated survey responses:", responsesForServer)

      const result = await updateSurveyResponses(user.email, responsesForServer)

      if (!result) {
        throw new Error("Failed to save survey responses")
      }

      toast({
        title: "Success",
        description: "Your survey responses have been updated",
      })
    } catch (error) {
      console.error("Error saving survey responses:", error)
      toast({
        title: "Error",
        description: "Failed to save your survey responses",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Please log in to view your profile.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} readOnly />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">News Preferences</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {surveyQuestions.map((question, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Label htmlFor={`q${index + 1}`} className="flex-1 cursor-pointer">
                      {question}
                    </Label>
                    <Switch
                      id={`q${index + 1}`}
                      checked={surveyResponses[`q${index + 1}` as keyof typeof surveyResponses]}
                      onCheckedChange={(checked) => handleSurveyChange(`q${index + 1}`, checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/feed")}>
            Back to Feed
          </Button>
          <Button onClick={handleSaveSurvey} disabled={loading || saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>
      <Toaster />
    </div>
  )
}
