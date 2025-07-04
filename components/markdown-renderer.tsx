"use client"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const renderMarkdown = (text: string) => {
    // Split by code blocks first to handle them separately
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.slice(lastIndex, match.index) })
      }

      // Add code block
      parts.push({
        type: "code",
        content: match[2],
        language: match[1] || "text",
      })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) })
    }

    return parts.map((part, index) => {
      if (part.type === "code") {
        return (
          <div key={index} className="my-4">
            <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] border-b border-gray-300 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{part.language}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(part.content)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-sm">
                <code className="text-gray-800 dark:text-gray-200">{part.content}</code>
              </pre>
            </div>
          </div>
        )
      }

      return (
        <div key={index} className="prose prose-gray dark:prose-invert max-w-none">
          {renderInlineMarkdown(part.content)}
        </div>
      )
    })
  }

  const renderInlineMarkdown = (text: string) => {
    // Handle inline code first
    const inlineCodeRegex = /`([^`]+)`/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: text.slice(lastIndex, match.index) })
      }

      // Add inline code
      parts.push({ type: "inline-code", content: match[1] })

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) })
    }

    return parts.map((part, index) => {
      if (part.type === "inline-code") {
        return (
          <code
            key={index}
            className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono"
          >
            {part.content}
          </code>
        )
      }

      return <span key={index}>{formatText(part.content)}</span>
    })
  }

  const formatText = (text: string) => {
    const lines = text.split("\n")

    return lines.map((line, lineIndex) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3 key={lineIndex} className="text-lg font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={lineIndex} className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={lineIndex} className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">
            {line.slice(2)}
          </h1>
        )
      }

      // Lists
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={lineIndex} className="ml-4 mb-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{formatInlineStyles(line)}</span>
          </div>
        )
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <div key={lineIndex} className="ml-4 mb-1 flex items-start">
            <span className="text-gray-500 dark:text-gray-400 mr-2 mt-1">•</span>
            <span className="text-gray-700 dark:text-gray-300">{formatInlineStyles(line.slice(2))}</span>
          </div>
        )
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={lineIndex}
            className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic text-gray-600 dark:text-gray-400"
          >
            {formatInlineStyles(line.slice(2))}
          </blockquote>
        )
      }

      // Empty lines
      if (line.trim() === "") {
        return <br key={lineIndex} />
      }

      // Regular paragraphs
      return (
        <p key={lineIndex} className="mb-2 text-gray-700 dark:text-gray-300 leading-relaxed">
          {formatInlineStyles(line)}
        </p>
      )
    })
  }

  const formatInlineStyles = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>')

    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

    // Links
    text = text.replace(
      /\[([^\]]+)\]$$([^)]+)$$/g,
      '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )

    return <span dangerouslySetInnerHTML={{ __html: text }} />
  }

  return <div className={cn("markdown-content", className)}>{renderMarkdown(content)}</div>
}
