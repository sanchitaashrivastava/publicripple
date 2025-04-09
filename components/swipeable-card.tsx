"use client"

import { useState, useRef, useEffect } from "react"
import { motion, type PanInfo, useAnimation, useMotionValue, useTransform } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface SwipeableCardProps {
  question: string
  onSwipe: (direction: "left" | "right") => void
  isActive: boolean
  animationTrigger?: { direction: "left" | "right" | null }
}

export function SwipeableCard({
  question,
  onSwipe,
  isActive,
  animationTrigger = { direction: null },
}: SwipeableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const [exitX, setExitX] = useState(0)

  // Reset card position when it becomes active
  useEffect(() => {
    if (isActive) {
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1, boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" })
    }
  }, [isActive, controls])

  // Handle animation trigger from button clicks
  useEffect(() => {
    if (!isActive || !animationTrigger.direction) return

    if (animationTrigger.direction === "right") {
      // Animate right swipe with green shadow
      controls
        .start({
          x: 200,
          rotate: 30,
          opacity: 0,
          boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.7)",
          transition: { duration: 0.5 },
        })
        .then(() => {
          onSwipe("right")
        })
    } else if (animationTrigger.direction === "left") {
      // Animate left swipe with red shadow
      controls
        .start({
          x: -200,
          rotate: -30,
          opacity: 0,
          boxShadow: "0px 0px 20px rgba(239, 68, 68, 0.7)",
          transition: { duration: 0.5 },
        })
        .then(() => {
          onSwipe("left")
        })
    }
  }, [animationTrigger, isActive, controls, onSwipe])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100

    if (info.offset.x > threshold) {
      // Swiped right (like)
      setExitX(200)
      controls.start({
        x: 200,
        rotate: 30,
        opacity: 0,
        boxShadow: "0px 0px 20px rgba(34, 197, 94, 0.7)",
        transition: { duration: 0.3 },
      })
      onSwipe("right")
    } else if (info.offset.x < -threshold) {
      // Swiped left (dislike)
      setExitX(-200)
      controls.start({
        x: -200,
        rotate: -30,
        opacity: 0,
        boxShadow: "0px 0px 20px rgba(239, 68, 68, 0.7)",
        transition: { duration: 0.3 },
      })
      onSwipe("left")
    } else {
      // Return to center if not swiped far enough
      controls.start({
        x: 0,
        rotate: 0,
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      })
    }
  }

  // Calculate opacity for the like/dislike indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1])
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0])

  // Calculate shadow color based on x position
  const shadowColor = useTransform(
    x,
    [-200, 0, 200],
    [
      "0px 0px 20px rgba(239, 68, 68, 0.5)", // Red shadow for left swipe
      "0px 0px 10px rgba(0, 0, 0, 0.1)", // Neutral shadow
      "0px 0px 20px rgba(34, 197, 94, 0.5)", // Green shadow for right swipe
    ],
  )

  return (
    <div className={`absolute w-full ${isActive ? "z-10" : "z-0"}`} ref={cardRef}>
      <motion.div
        style={{
          x,
          rotate,
          boxShadow: shadowColor,
        }}
        drag={isActive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="w-full cursor-grab active:cursor-grabbing"
      >
        <Card className="w-full h-[400px] shadow-lg border-2 overflow-hidden">
          <CardContent className="p-6 h-full flex flex-col justify-center items-center relative">
            {/* Like indicator */}
            <motion.div
              className="absolute top-4 right-4 bg-green-100 text-green-600 p-2 rounded-full"
              style={{ opacity: likeOpacity }}
            >
              <Check size={24} />
            </motion.div>

            {/* Dislike indicator */}
            <motion.div
              className="absolute top-4 left-4 bg-red-100 text-red-600 p-2 rounded-full"
              style={{ opacity: dislikeOpacity }}
            >
              <X size={24} />
            </motion.div>

            <div className="text-center">
              <h3 className="text-xl font-medium mb-4">What do you think?</h3>
              <p className="text-lg">{question}</p>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-between px-10 text-sm text-muted-foreground">
              <div>← Disagree</div>
              <div>Agree →</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
