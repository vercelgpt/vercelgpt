export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  model: string
}

export class ChatManager {
  private static STORAGE_KEY = "gpt-ui-chats"
  private static CURRENT_CHAT_KEY = "gpt-ui-current-chat"

  static getAllChats(): Chat[] {
    if (typeof window === "undefined") {
      console.log("Window undefined, returning empty array")
      return []
    }

    try {
      const chats = localStorage.getItem(this.STORAGE_KEY)
      console.log("Raw chats from localStorage:", chats)
      const parsed = chats ? JSON.parse(chats) : []
      console.log("Parsed chats:", parsed)
      return parsed
    } catch (error) {
      console.error("Error loading chats:", error)
      return []
    }
  }

  static saveChat(chat: Chat): void {
    if (typeof window === "undefined") {
      console.log("Window undefined, not saving")
      return
    }

    console.log("ChatManager.saveChat called with:", chat)

    const chats = this.getAllChats()
    console.log("Existing chats:", chats)

    const existingIndex = chats.findIndex((c) => c.id === chat.id)

    if (existingIndex >= 0) {
      // Update existing chat
      console.log("Updating existing chat at index:", existingIndex)
      chats[existingIndex] = { ...chat, updatedAt: Date.now() }
    } else {
      // Add new chat at the beginning
      console.log("Adding new chat")
      chat.createdAt = Date.now()
      chat.updatedAt = Date.now()
      chats.unshift(chat)
    }

    // Keep only last 100 chats
    const limitedChats = chats.slice(0, 100)
    console.log("Saving to localStorage:", limitedChats)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedChats))
    console.log("Saved successfully")
  }

  static deleteChat(chatId: string): void {
    if (typeof window === "undefined") return

    const chats = this.getAllChats()
    const filteredChats = chats.filter((c) => c.id !== chatId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredChats))
  }

  static getCurrentChatId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.CURRENT_CHAT_KEY)
  }

  static setCurrentChatId(chatId: string | null): void {
    if (typeof window === "undefined") return

    if (chatId) {
      localStorage.setItem(this.CURRENT_CHAT_KEY, chatId)
    } else {
      localStorage.removeItem(this.CURRENT_CHAT_KEY)
    }
  }

  static generateChatTitle(firstMessage: string): string {
    if (!firstMessage || firstMessage.trim().length === 0) {
      return "Nowa rozmowa"
    }

    // Clean the message and generate title
    const cleanMessage = firstMessage.trim().replace(/\n+/g, " ")
    const title = cleanMessage.slice(0, 60)
    return title.length < cleanMessage.length ? title + "..." : title
  }

  static generateChatId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static getChat(chatId: string): Chat | null {
    if (typeof window === "undefined") return null

    const chats = this.getAllChats()
    return chats.find((c) => c.id === chatId) || null
  }
}
