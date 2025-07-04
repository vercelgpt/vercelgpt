"use client"

import * as React from "react"
import { Copy, RotateCcw, Share } from "@/components/icons"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { aiModels } from "@/lib/constants"
import { PromptBox } from "../prompt-box-demo"
import { SidebarInset, SidebarTrigger, useSidebar } from "./ui/sidebar"
import { ChatManager, type Chat, type ChatMessage } from "@/lib/chat-manager"
import { useIsMobile } from "@/hooks/use-mobile"
import { ReasoningDisplay } from "./reasoning-display"
import { MarkdownRenderer } from "./markdown-renderer"

// Extended ChatMessage interface to include reasoning
interface ExtendedChatMessage extends ChatMessage {
  reasoning?: string
}

// Model Selector Component for Header
const HeaderModelSelector = () => {
  const [selectedModel, setSelectedModel] = React.useState(
    aiModels.find((m) => m.id === "deepseek-ai/deepseek-r1-0528") || aiModels[0],
  )
  const [isOpen, setIsOpen] = React.useState(false)
  const [, setCurrentModel] = React.useState(aiModels[0].id)

  const handleModelSelect = (model: (typeof aiModels)[0]) => {
    setSelectedModel(model)
    setCurrentModel(model.id)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild></PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="p-2">
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Wybierz model AI</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Dostępne modele do konwersacji</p>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-600 mx-2"></div>
          {aiModels.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                handleModelSelect(model)
              }}
              className={`w-full text-left p-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedModel.id === model.id ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{model.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg">
                    {model.provider}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{model.description}</p>
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Reusable Message Components
const UserMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end mb-4 w-full">
    <div className="bg-gray-100 dark:bg-[#1c1c1c] text-gray-900 dark:text-white px-4 py-2 rounded-2xl max-w-[80%] ml-auto">
      {children}
    </div>
  </div>
)

const AssistantMessage = ({ children, reasoning }: { children: React.ReactNode; reasoning?: string }) => (
  <div className="flex justify-start mb-4 w-full">
    <div className="text-gray-900 dark:text-gray-100 px-0 py-0 max-w-[80%] mr-auto">
      {reasoning && <ReasoningDisplay reasoning={reasoning} isComplete={true} />}
      <div>{children}</div>
    </div>
  </div>
)

const ActionButtons = () => (
  <div className="flex justify-start mb-6 ml-1">
    <div className="flex gap-2">
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
        <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
        <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  </div>
)

export default function ChatScreen() {
  const [messages, setMessages] = React.useState<ExtendedChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [currentModel, setCurrentModel] = React.useState("deepseek-ai/deepseek-r1-0528")
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null)
  const [streamingReasoning, setStreamingReasoning] = React.useState("")
  const [streamingContent, setStreamingContent] = React.useState("")
  const [isReasoningComplete, setIsReasoningComplete] = React.useState(false)
  const promptBoxRef = React.useRef<HTMLTextAreaElement>(null)
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  // Save chat whenever messages change
  React.useEffect(() => {
    if (messages.length > 0 && currentChatId) {
      const chat: Chat = {
        id: currentChatId,
        title: ChatManager.generateChatTitle(messages[0]?.content || "Nowa rozmowa"),
        messages: messages.map((msg) => ({ role: msg.role, content: msg.content, timestamp: msg.timestamp })),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: currentModel,
      }

      ChatManager.saveChat(chat)
      window.dispatchEvent(new CustomEvent("chats-updated"))
    }
  }, [messages, currentChatId, currentModel])

  React.useEffect(() => {
    // Handle initial message from start screen
    const initialMessage = sessionStorage.getItem("initialMessage")
    const selectedModel = sessionStorage.getItem("selectedModel")

    if (initialMessage) {
      // Clear sessionStorage
      sessionStorage.removeItem("initialMessage")
      sessionStorage.removeItem("selectedModel")

      // Set model if provided
      if (selectedModel) {
        setCurrentModel(selectedModel)
      }

      // Create new chat
      const newChatId = ChatManager.generateChatId()
      setCurrentChatId(newChatId)
      ChatManager.setCurrentChatId(newChatId)

      // Add user message and send to API
      const userMessage: ExtendedChatMessage = {
        role: "user",
        content: initialMessage,
        timestamp: Date.now(),
      }

      setMessages([userMessage])
      setIsLoading(true)

      // Call streaming API
      handleStreamingMessage(initialMessage, selectedModel || currentModel)
    } else {
      // Check if we should load an existing chat
      const currentId = ChatManager.getCurrentChatId()
      if (currentId) {
        const chats = ChatManager.getAllChats()
        const existingChat = chats.find((c) => c.id === currentId)
        if (existingChat) {
          setCurrentChatId(currentId)
          setMessages(existingChat.messages.map((msg) => ({ ...msg })))
          setCurrentModel(existingChat.model)
        }
      }
    }

    // Listen for new chat event
    const handleNewChat = () => {
      setMessages([])
      setCurrentChatId(null)
      setIsLoading(false)
      setStreamingReasoning("")
      setStreamingContent("")
      setIsReasoningComplete(false)
    }

    // Listen for load chat event
    const handleLoadChat = (event: CustomEvent) => {
      const chat = event.detail as Chat
      setCurrentChatId(chat.id)
      setMessages(chat.messages.map((msg) => ({ ...msg })))
      setCurrentModel(chat.model)
      setIsLoading(false)
      setStreamingReasoning("")
      setStreamingContent("")
      setIsReasoningComplete(false)
    }

    window.addEventListener("new-chat", handleNewChat)
    window.addEventListener("load-chat", handleLoadChat as EventListener)

    return () => {
      window.removeEventListener("new-chat", handleNewChat)
      window.removeEventListener("load-chat", handleLoadChat as EventListener)
    }
  }, [])

  const handleStreamingMessage = async (
    message: string,
    model: string,
    existingMessages: ExtendedChatMessage[] = [],
  ) => {
    try {
      // Reset streaming states
      setStreamingReasoning("")
      setStreamingContent("")
      setIsReasoningComplete(false)

      // Prepare messages for API
      const chatMessages = existingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add current message
      chatMessages.push({ role: "user", content: message })

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatMessages,
          model: model,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      let finalContent = ""
      let finalReasoning = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Ensure value is a Uint8Array before decoding
        if (!(value instanceof Uint8Array)) {
          console.warn("Received non-Uint8Array value:", value)
          continue
        }

        const chunk = decoder.decode(value, { stream: true })

        if (chunk.startsWith("REASONING:")) {
          const reasoningChunk = chunk.slice(10)
          finalReasoning += reasoningChunk
          setStreamingReasoning(finalReasoning)
        } else if (chunk.startsWith("CONTENT:")) {
          const contentChunk = chunk.slice(8)
          finalContent += contentChunk
          setStreamingContent(finalContent)
          setIsReasoningComplete(true)
        } else {
          // Handle regular content
          finalContent += chunk
          setStreamingContent(finalContent)
        }
      }

      // Add final assistant response with reasoning
      const assistantMessage: ExtendedChatMessage = {
        role: "assistant",
        content: finalContent,
        timestamp: Date.now(),
        reasoning: finalReasoning,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Clear streaming states
      setStreamingReasoning("")
      setStreamingContent("")
      setIsReasoningComplete(false)
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: ExtendedChatMessage = {
        role: "assistant",
        content: `Przepraszam, wystąpił błąd podczas przetwarzania Twojej wiadomości: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])

      // Clear streaming states
      setStreamingReasoning("")
      setStreamingContent("")
      setIsReasoningComplete(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = formData.get("message") as string

    if (!message && !event.currentTarget.querySelector("img")) {
      return
    }

    // Create new chat if none exists
    let chatId = currentChatId
    if (!chatId) {
      chatId = ChatManager.generateChatId()
      setCurrentChatId(chatId)
      ChatManager.setCurrentChatId(chatId)
    }

    // Add user message
    const userMessage: ExtendedChatMessage = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Call streaming API
    await handleStreamingMessage(message, currentModel, messages)

    // Reset form
    event.currentTarget.reset()
  }

  const clearPromptBox = () => {
    if (promptBoxRef.current) {
      promptBoxRef.current.value = ""
    }
  }

  // Mobile PWA layout - używa tego samego układu co home screen
  if (isMobile) {
    return (
      <SidebarInset className="relative flex flex-col items-center justify-start p-4">
        {/* Header z home screen - zawsze widoczny */}
        <div className="absolute top-0 left-0 right-0 z-10 px-3 py-3 bg-transparent backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="rounded-full hover:bg-gray-100 dark:hover:bg-[#404040]" />
              <span className="text-black dark:text-white font-medium text-base">DeepSeek R1</span>
            </div>

            <div className="flex justify-center">
              <HeaderModelSelector />
            </div>

            <div className="w-[120px]" />
          </div>
        </div>

        {/* Messages Area - scrollable */}
        <div
          className="w-full flex-1 overflow-auto scrollbar-hide"
          style={{
            paddingTop: "5rem",
            paddingBottom: "9rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="w-full max-w-4xl mx-auto">
            {messages.map((message, index) => {
              if (message.role === "user") {
                return <UserMessage key={index}>{message.content}</UserMessage>
              } else {
                return (
                  <React.Fragment key={index}>
                    <AssistantMessage reasoning={message.reasoning}>
                      <MarkdownRenderer content={message.content} />
                    </AssistantMessage>
                    <ActionButtons />
                  </React.Fragment>
                )
              }
            })}

            {/* Show streaming reasoning and content */}
            {isLoading && (
              <div className="flex justify-start mb-4 w-full">
                <div className="text-gray-900 dark:text-gray-100 px-0 py-0 max-w-[80%] mr-auto">
                  {streamingReasoning && (
                    <ReasoningDisplay reasoning={streamingReasoning} isComplete={isReasoningComplete} />
                  )}

                  {streamingContent && <MarkdownRenderer content={streamingContent} />}

                  {!streamingReasoning && !streamingContent && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rounded-full animate-pulse"
                        style={{ animation: "pulse-grow 1.5s ease-in-out infinite" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <PromptBox ref={promptBoxRef} name="message" onClear={clearPromptBox} />
        </form>
      </SidebarInset>
    )
  }

  // Desktop layout - NIE TYKAM
  return (
    <SidebarInset className="safe-area-top safe-area-bottom">
      {/* Header z zawsze widocznym SidebarTrigger i Model Selector - na samej górze - transparent */}
      <div className="absolute top-0 left-0 right-0 z-10 px-3 py-3 bg-transparent backdrop-blur-sm">
        <div className="grid grid-cols-3 items-center">
          <div className="flex justify-start items-center gap-4">
            <SidebarTrigger className="rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a]" />
            <span className="text-black dark:text-white font-medium text-base">DeepSeek R1</span>
          </div>

          <div className="flex justify-center">
            <HeaderModelSelector />
          </div>

          <div />
        </div>
      </div>

      <div className="flex flex-col h-full pt-16">
        {/* Scrollable Messages Area */}
        <div
          className="flex-1 overflow-auto p-4 safe-area-left safe-area-right scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => {
              if (message.role === "user") {
                return <UserMessage key={index}>{message.content}</UserMessage>
              } else {
                return (
                  <React.Fragment key={index}>
                    <AssistantMessage reasoning={message.reasoning}>
                      <MarkdownRenderer content={message.content} />
                    </AssistantMessage>
                    <ActionButtons />
                  </React.Fragment>
                )
              }
            })}

            {/* Show streaming reasoning and content */}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="text-gray-900 dark:text-gray-100 px-0 py-0 max-w-xs md:max-w-md lg:max-w-2xl w-full">
                  {streamingReasoning && (
                    <ReasoningDisplay reasoning={streamingReasoning} isComplete={isReasoningComplete} />
                  )}

                  {streamingContent && <MarkdownRenderer content={streamingContent} />}

                  {!streamingReasoning && !streamingContent && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rounded-full animate-pulse"
                        style={{ animation: "pulse-grow 1.5s ease-in-out infinite" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Input - transparent */}
        <div className="sticky bottom-0 z-10 p-4 bg-transparent backdrop-blur-sm border-t border-transparent safe-area-bottom safe-area-left safe-area-right">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
            <PromptBox ref={promptBoxRef} name="message" onClear={clearPromptBox} />
          </form>
        </div>
      </div>
    </SidebarInset>
  )
}
