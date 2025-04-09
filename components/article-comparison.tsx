"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Minus, Check } from "lucide-react" // Added Check here

// --- Configuration ---
// Define consistent colors for Left/Right choices
const LEFT_CHOICE_COLOR = "#6366f1"; // Indigo-500
const RIGHT_CHOICE_COLOR = "#ec4899"; // Pink-500
const NEUTRAL_CHOICE_COLOR = "#6b7280"; // Gray-500
const NEUTRAL_HOVER_COLOR = "#4b5563"; // Gray-600

// --- Interfaces ---
interface Article {
  title: string
  source: string
  url: string
  imageUrl: string
  // color property is no longer used from props
}

interface ArticleComparisonProps {
  leftArticle: Article
  rightArticle: Article
  onSelect: (selection: "left" | "center" | "right") => void
  selectedOption: "left" | "center" | "right" | null
  isTransitioning: boolean
  direction: "next" | "prev" | null
}

export function ArticleComparison({
  leftArticle,
  rightArticle,
  onSelect,
  selectedOption,
  isTransitioning,
  direction,
}: ArticleComparisonProps) {
  const [hoveredOption, setHoveredOption] = useState<"left" | "center" | "right" | null>(null)

  // Use a fixed height or calculate dynamically if needed, but fixed is simpler here
  const componentHeight = 500 // Fixed height in pixels

  // --- Animation Variants ---
  const containerVariants = {
    hidden: (direction: "next" | "prev" | null) => ({
      opacity: 0,
      x: direction === "next" ? 50 : direction === "prev" ? -50 : 0,
    }),
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: (direction: "next" | "prev" | null) => ({
      opacity: 0,
      x: direction === "next" ? -50 : direction === "prev" ? 50 : 0,
      transition: { duration: 0.3, ease: "easeIn" },
    }),
  }

  // Overlay dims slightly on hover/selection for better text pop
  const overlayVariants = {
    initial: { opacity: 0.6 }, // Default dimness
    hover: { opacity: 0.75, transition: { duration: 0.3 } },
    selected: { opacity: 0.8, transition: { duration: 0.3 } },
  }

  // --- Component Rendering ---
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={`${leftArticle.title}-${rightArticle.title}`} // Unique key for AnimatePresence
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        custom={direction}
        className="relative w-full flex rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white" // Added container style
        style={{ height: `${componentHeight}px` }}
      >
        {/* --- Left Choice --- */}
        <motion.div
          className="relative w-1/2 h-full cursor-pointer group" // Use group for hover effects
          onClick={() => !isTransitioning && onSelect("left")}
          onMouseEnter={() => setHoveredOption("left")}
          onMouseLeave={() => setHoveredOption(null)}
          // Apply visual indication for selection and hover via animate prop
          animate={selectedOption === "left" ? "selected" : hoveredOption === "left" ? "hover" : "initial"}
          transition={{ duration: 0.3 }} // Smooth transition for styles controlled by animate
          style={{
            // Use boxShadow for a clear selection ring
            boxShadow: selectedOption === 'left' ? `inset 0 0 0 6px ${LEFT_CHOICE_COLOR}` : hoveredOption === 'left' ? `inset 0 0 0 4px ${LEFT_CHOICE_COLOR}66` : 'none', // Inner shadow/ring
             zIndex: hoveredOption === 'left' || selectedOption === 'left' ? 10 : 1,
          }}
        >
          {/* Background Image */}
          <Image
            src={leftArticle.imageUrl || "/placeholder.svg"}
            alt={`Background for ${leftArticle.title}`}
            fill
            sizes="50vw" // Image takes up half the viewport width
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 ease-out group-hover:scale-105" // Zoom effect
            priority={true}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg?text=Image+Error";
              (e.target as HTMLImageElement).style.objectFit = "contain";
            }}
          />
          {/* Color Overlay - Consistent Color */}
          <motion.div
            className="absolute inset-0"
            variants={overlayVariants} // Control opacity via variants
            style={{ backgroundColor: LEFT_CHOICE_COLOR }} // Use consistent color
          />
          {/* Content - Always Visible */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-8 text-white pointer-events-none"> {/* Added pointer-events-none */}
            {/* Source Badge */}
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
                {leftArticle.source}
              </span>
            </div>
            {/* Title */}
            <div className="text-right max-w-lg ml-auto">
              <h2 className="text-lg md:text-2xl font-bold leading-tight shadow-black [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]"> {/* Added text shadow */}
                {leftArticle.title}
              </h2>
            </div>
          </div>
           {/* Selection Checkmark (Optional) */}
           <AnimatePresence>
             {selectedOption === "left" && (
                <motion.div
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.5 }}
                   className="absolute bottom-4 right-4 bg-white rounded-full p-1 shadow-lg z-10"
                >
                   <Check className="w-4 h-4 text-green-600" />
                </motion.div>
             )}
          </AnimatePresence>
        </motion.div>

        {/* --- Right Choice --- */}
        <motion.div
          className="relative w-1/2 h-full cursor-pointer group"
          onClick={() => !isTransitioning && onSelect("right")}
          onMouseEnter={() => setHoveredOption("right")}
          onMouseLeave={() => setHoveredOption(null)}
          animate={selectedOption === "right" ? "selected" : hoveredOption === "right" ? "hover" : "initial"}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: selectedOption === 'right' ? `inset 0 0 0 6px ${RIGHT_CHOICE_COLOR}` : hoveredOption === 'right' ? `inset 0 0 0 4px ${RIGHT_CHOICE_COLOR}66` : 'none',
            zIndex: hoveredOption === 'right' || selectedOption === 'right' ? 10 : 1,
          }}
        >
          {/* Background Image */}
          <Image
            src={rightArticle.imageUrl || "/placeholder.svg"}
            alt={`Background for ${rightArticle.title}`}
            fill
            sizes="50vw"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
            priority={true}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg?text=Image+Error";
              (e.target as HTMLImageElement).style.objectFit = "contain";
            }}
          />
          {/* Color Overlay - Consistent Color */}
          <motion.div
            className="absolute inset-0"
            variants={overlayVariants}
            style={{ backgroundColor: RIGHT_CHOICE_COLOR }}
          />
          {/* Content - Always Visible */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-8 text-white pointer-events-none">
            {/* Source Badge */}
            <div>
              <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium">
                {rightArticle.source}
              </span>
            </div>
            {/* Title */}
            <div className="text-left max-w-lg mr-auto">
              <h2 className="text-lg md:text-2xl font-bold leading-tight shadow-black [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]">
                {rightArticle.title}
              </h2>
            </div>
          </div>
           {/* Selection Checkmark (Optional) */}
            <AnimatePresence>
               {selectedOption === "right" && (
                   <motion.div
                       initial={{ opacity: 0, scale: 0.5 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.5 }}
                       className="absolute bottom-4 left-4 bg-white rounded-full p-1 shadow-lg z-10"
                   >
                       <Check className="w-4 h-4 text-green-600" />
                   </motion.div>
               )}
            </AnimatePresence>
        </motion.div>

        {/* --- Neutral Option Button --- */}
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" // High z-index
          onMouseEnter={() => setHoveredOption("center")}
          onMouseLeave={() => setHoveredOption(null)}
          onClick={() => !isTransitioning && onSelect("center")}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTransitioning}
            className={`
              px-5 py-3 rounded-full cursor-pointer flex items-center gap-2 text-sm font-semibold shadow-xl
              transition-all duration-200 ease-in-out border
              ${
                selectedOption === "center"
                  ? `bg-[${NEUTRAL_CHOICE_COLOR}] text-white border-transparent ring-2 ring-offset-2 ring-[${NEUTRAL_CHOICE_COLOR}] ring-offset-white` // Selected style
                  : hoveredOption === "center"
                    ? `bg-[${NEUTRAL_HOVER_COLOR}] text-white border-transparent` // Hover style
                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50" // Default style
              }
            `}
          >
            <Minus className="h-4 w-4" />
            <span>Neutral / Unsure</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}