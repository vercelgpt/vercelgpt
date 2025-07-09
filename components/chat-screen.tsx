"use client"

import * as React from "react"
import { useChat } from "ai/react"
import { Copy, RotateCcw, Share } from "@/components/icons"
import { PromptBox } from "../prompt-box-demo"
import { SidebarInset } from "./ui/sidebar"
import { ChatManager, type Chat } from "@/lib/chat-manager"
import { useIsMobile } from "@/hooks/use-mobile"
import { MarkdownRenderer } from "./markdown-renderer"
import { SharedHeader } from "./shared-header"

const UserMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end mb-4 w-full">
    <div className="bg-gray-100 dark:bg-[#1c1c1c] text-gray-900 dark:text-white px-4 py-2 rounded-2xl max-w-[80%] ml-auto">
      {children}
    </div>
  </div>
)

const AssistantMessage = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-start mb-4 w-full">
    <div className="text-gray-900 dark:text-gray-100 px-0 py-0 max-w-[80%] mr-auto">
      <div>{children}</div>
    </div>
  </div>
)

const LoadingIndicator = () => (
  <div className="flex justify-start mb-4 w-full">
    <div className="px-0 py-2 max-w-[80%] mr-auto">
      <div className="w-[10px] h-[10px] bg-black dark:bg-white rounded-full animate-pulse-grow shadow-sm"></div>
    </div>
  </div>
)

const ActionButtons = ({ onRegenerate }: { onRegenerate: () => void }) => (
  <div className="flex justify-start mb-6 ml-1">
    <div className="flex gap-2">
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={onRegenerate}
        className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
      >
        <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors">
        <Share className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  </div>
)

export default function ChatScreen() {
  const [currentModel, setCurrentModel] = React.useState("gemini-1.5-pro")
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null)
  const [hasAutoSent, setHasAutoSent] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [showLoadingIndicator, setShowLoadingIndicator] = React.useState(false)
  const isMobile = useIsMobile()

  const { messages, input, handleInputChange, handleSubmit, isLoading, append, stop, reload, error } = useChat({
    api: "/api/chat",
    body: {
      model: currentModel,
    },
    streamProtocol: "text",
    onError: (error) => {
      console.error("Chat error:", error)
      setShowLoadingIndicator(false)
    },
    onFinish: (message) => {
      console.log("Message finished:", message)
      setShowLoadingIndicator(false)
      if (currentChatId) {
        const allMessages = [...messages, message]
        const chat: Chat = {
          id: currentChatId,
          title: ChatManager.generateChatTitle(allMessages[0]?.content || "Nowa rozmowa"),
          messages: allMessages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: Date.now(),
          })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          model: currentModel,
        }
        ChatManager.saveChat(chat)
        window.dispatchEvent(new CustomEvent("chats-updated"))
      }
    },
  })

  React.useEffect(() => {
    if (isInitialized) return

    const loadChatData = sessionStorage.getItem("loadChatData")
    if (loadChatData) {
      const chat: Chat = JSON.parse(loadChatData)
      sessionStorage.removeItem("loadChatData")
      setCurrentChatId(chat.id)
      setCurrentModel(chat.model)
      setIsInitialized(true)
      return
    }

    const initialMessage = sessionStorage.getItem("initialMessage")
    const selectedModel = sessionStorage.getItem("selectedModel")
    const newChatId = sessionStorage.getItem("newChatId")

    if (initialMessage && !hasAutoSent) {
      sessionStorage.removeItem("initialMessage")
      sessionStorage.removeItem("selectedModel")
      sessionStorage.removeItem("newChatId")

      if (selectedModel) {
        setCurrentModel(selectedModel)
      }

      const chatId = newChatId || ChatManager.generateChatId()
      setCurrentChatId(chatId)
      ChatManager.setCurrentChatId(chatId)

      setHasAutoSent(true)
      setIsInitialized(true)

      setTimeout(() => {
        append({
          role: "user",
          content: initialMessage,
        })
      }, 100)
    } else {
      setIsInitialized(true)
    }
  }, [hasAutoSent, append, isInitialized])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentChatId) {
      const newChatId = ChatManager.generateChatId()
      setCurrentChatId(newChatId)
      ChatManager.setCurrentChatId(newChatId)
    }

    setShowLoadingIndicator(true)
    handleSubmit(e)
  }

  const handleRegenerate = () => {
    if (messages.length > 0) {
      setShowLoadingIndicator(true)
      reload()
    }
  }

  if (!isInitialized) {
    return (
      <SidebarInset className="relative flex flex-col items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </SidebarInset>
    )
  }

  if (isMobile) {
    return (
      <SidebarInset className="relative flex flex-col items-center justify-start p-4">
        <SharedHeader showModelSelector={true} currentModel={currentModel} onModelChange={setCurrentModel} />

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
            {error && (
              <div className="w-full max-w-4xl mx-auto mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">Błąd: {error.message}</p>
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              if (message.role === "user") {
                return <UserMessage key={index}>{message.content}</UserMessage>
              } else {
                return (
                  <React.Fragment key={index}>
                    <AssistantMessage>
                      <MarkdownRenderer content={message.content} />
                    </AssistantMessage>
                    {index === messages.length - 1 && !isLoading && <ActionButtons onRegenerate={handleRegenerate} />}
                  </React.Fragment>
                )
              }
            })}
            {(showLoadingIndicator ||
              (isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user")) && (
              <LoadingIndicator />
            )}
          </div>
        </div>

        <form onSubmit={onSubmit} className="w-full max-w-xl">
          <input type="hidden" name="message" value={input} />
          <PromptBox
            name="message"
            value={input}
            onChange={(e) => handleInputChange(e)}
            isLoading={isLoading}
            onStop={stop}
          />
        </form>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset className="safe-area-top safe-area-bottom">
      <SharedHeader showModelSelector={true} currentModel={currentModel} onModelChange={setCurrentModel} />

      <div className="flex flex-col h-full pt-16">
        <div
          className="flex-1 overflow-auto p-4 safe-area-left safe-area-right scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="max-w-4xl mx-auto">
            {error && (
              <div className="w-full max-w-4xl mx-auto mb-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 text-sm">Błąd: {error.message}</p>
                </div>
              </div>
            )}
            {messages.map((message, index) => {
              if (message.role === "user") {
                return <UserMessage key={index}>{message.content}</UserMessage>
              } else {
                return (
                  <React.Fragment key={index}>
                    <AssistantMessage>
                      <MarkdownRenderer content={message.content} />
                    </AssistantMessage>
                    {index === messages.length - 1 && !isLoading && <ActionButtons onRegenerate={handleRegenerate} />}
                  </React.Fragment>
                )
              }
            })}
            {(showLoadingIndicator ||
              (isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user")) && (
              <LoadingIndicator />
            )}
          </div>
        </div>

        <div className="sticky bottom-0 z-10 p-4 bg-transparent backdrop-blur-sm border-t border-transparent safe-area-bottom safe-area-left safe-area-right">
          <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto">
            <input type="hidden" name="message" value={input} />
            <PromptBox
              name="message"
              value={input}
              onChange={(e) => handleInputChange(e)}
              isLoading={isLoading}
              onStop={stop}
            />
          </form>
        </div>
      </div>
    </SidebarInset>
  )
}
