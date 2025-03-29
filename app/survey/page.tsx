"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const questions = [
  "I prefer to see content that aligns with my political beliefs",
  "I am comfortable engaging with political views that differ from my own",
  "I would rather avoid political content altogether",
  "I enjoy reading about social issues, even if the content challenges my beliefs",
  "I enjoy reading about social issues, even if the content challenges my beliefs",
]

export default function SurveyPage() {
  const router = useRouter()
  const [responses, setResponses] = useState(Array(questions.length).fill(5))

  const handleSliderChange = (index: number, value: number[]) => {
    const newResponses = [...responses]
    newResponses[index] = value[0]
    setResponses(newResponses)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd send this data to your backend
    console.log(responses)
    router.push("/feed")
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">News Preference Survey</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`question-${index}`}>{question}</Label>
            <Slider
              id={`question-${index}`}
              min={1}
              max={10}
              step={1}
              value={[responses[index]]}
              onValueChange={(value) => handleSliderChange(index, value)}
              className="py-4"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        ))}
        <Button type="submit" className="w-full">
          Submit Survey
        </Button>
      </form>
    </div>
  )
}

