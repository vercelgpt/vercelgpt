"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "@/components/icons"
import { cn } from "@/lib/utils"

interface ReasoningDisplayProps {
  reasoning: string
  isComplete: boolean
}

export function ReasoningDisplay({ reasoning, isComplete }: ReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (!reasoning) return null

  return (
    <div className="mb-2">
      <div onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 cursor-pointer mb-2 group">
        <motion.div
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          animate={{
            backgroundPosition: isComplete ? "200% center" : ["0% center", "200% center"],
          }}
          transition={{
            duration: isComplete ? 0 : 1.5,
            repeat: isComplete ? 0 : Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: isComplete
              ? "none"
              : "linear-gradient(90deg, transparent 0%, currentColor 30%, rgba(255,255,255,0.9) 50%, currentColor 70%, transparent 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: isComplete ? "unset" : "text",
            WebkitTextFillColor: isComplete ? "currentColor" : "transparent",
            backgroundClip: isComplete ? "unset" : "text",
          }}
        >
          Reasoning
        </motion.div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 group-hover:text-gray-700 dark:group-hover:text-gray-200",
            isExpanded && "rotate-180",
          )}
        />
      </div>

      {isExpanded && (
        <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 rounded-r-lg p-4 mb-2">
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed italic">
            {reasoning}
          </div>
        </div>
      )}
    </div>
  )
}
