"use client"
import type * as ReactType from "react"
import { useRouter } from "next/navigation"
import { PromptBox } from "../prompt-box-demo"
import { SidebarInset } from "@/components/ui/sidebar"
import { PWAInstall } from "@/components/pwa-install"
import { SharedHeader } from "@/components/shared-header"
import { useState, useEffect } from "react"
import { ChatManager } from "@/lib/chat-manager"

const CURRENT_MODEL = "gemini-1.5-pro"

export default function Page() {
  const router = useRouter()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentModel, setCurrentModel] = useState(CURRENT_MODEL)

  const handleSubmit = async (event: ReactType.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = formData.get("message") as string

    if (!message && !event.currentTarget.querySelector("img")) {
      return
    }

    setIsTransitioning(true)

    const newChatId = ChatManager.generateChatId()
    ChatManager.setCurrentChatId(newChatId)

    sessionStorage.setItem("initialMessage", message)
    sessionStorage.setItem("selectedModel", currentModel)
    sessionStorage.setItem("newChatId", newChatId)

    setTimeout(() => {
      router.push("/chat")
    }, 150)
  }

  useEffect(() => {
    sessionStorage.removeItem("initialMessage")
    sessionStorage.removeItem("selectedModel")
    sessionStorage.removeItem("newChatId")
    ChatManager.setCurrentChatId(null)
  }, [])

  return (
    <SidebarInset
      className={`relative flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
    >
      <SharedHeader showModelSelector={true} currentModel={currentModel} onModelChange={setCurrentModel} />

      <div className="w-full max-w-xl flex flex-col gap-10">
        <p className="text-center text-3xl text-foreground dark:text-white">How Can I Help You</p>
        <form onSubmit={handleSubmit} className="w-full">
          <PromptBox name="message" />
        </form>
      </div>

      <PWAInstall />
    </SidebarInset>
  )
}
