"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarFooter,
} from "./ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { OpenAIIcon, XIcon } from "@/components/icons"
import { ChatManager, type Chat } from "@/lib/chat-manager"
import { SettingsModal } from "./settings-modal"

export function AppSidebar() {
  const router = useRouter()
  const [chats, setChats] = React.useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = React.useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  // Load chats on mount
  React.useEffect(() => {
    console.log("Loading chats on mount...")
    const loadedChats = ChatManager.getAllChats()
    const currentId = ChatManager.getCurrentChatId()
    console.log("Loaded chats:", loadedChats)
    console.log("Current chat ID:", currentId)
    setChats(loadedChats)
    setCurrentChatId(currentId)
  }, [])

  // Listen for storage changes to sync across tabs
  React.useEffect(() => {
    const handleStorageChange = () => {
      console.log("Storage changed, reloading chats...")
      const loadedChats = ChatManager.getAllChats()
      const currentId = ChatManager.getCurrentChatId()
      console.log("Reloaded chats:", loadedChats)
      setChats(loadedChats)
      setCurrentChatId(currentId)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("chats-updated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("chats-updated", handleStorageChange)
    }
  }, [])

  const handleNewChat = () => {
    // Clear current chat
    ChatManager.setCurrentChatId(null)
    setCurrentChatId(null)

    // Navigate to home page
    router.push("/")

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("new-chat"))
  }

  const handleChatClick = (chat: Chat) => {
    // Don't reload if it's already the current chat
    if (currentChatId === chat.id) {
      return
    }

    ChatManager.setCurrentChatId(chat.id)
    setCurrentChatId(chat.id)

    // Store chat data for loading
    sessionStorage.setItem("loadChatData", JSON.stringify(chat))

    // Navigate to chat page
    router.push("/chat")
  }

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()

    ChatManager.deleteChat(chatId)

    // If we're deleting the current chat, clear it
    if (currentChatId === chatId) {
      ChatManager.setCurrentChatId(null)
      setCurrentChatId(null)
      router.push("/")
    }

    // Update local state
    setChats((prev) => prev.filter((c) => c.id !== chatId))

    // Notify other components
    window.dispatchEvent(new CustomEvent("chats-updated"))
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes < 1 ? "Teraz" : `${diffInMinutes} min temu`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} godz. temu`
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} dni temu`
    } else {
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "short",
        year: diffInDays > 365 ? "numeric" : undefined,
      })
    }
  }

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <OpenAIIcon className="w-6 h-6 text-black dark:text-white" />
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleNewChat}
                  className="rounded-[20px] h-12 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                >
                  <img src="/edit-icon.svg" alt="New chat" className="h-4 w-4" />
                  <span>Nowy czat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 px-2 py-1">
            Historia rozmów ({chats.length})
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <SidebarMenuItem>
                  <div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Brak zapisanych rozmów
                    <br />
                    <button
                      onClick={() => {
                        console.log("Debug - Current localStorage:", localStorage.getItem("gpt-ui-chats"))
                        console.log("Debug - All chats:", ChatManager.getAllChats())
                      }}
                      className="text-xs underline mt-2"
                    >
                      Debug
                    </button>
                  </div>
                </SidebarMenuItem>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => handleChatClick(chat)}
                      className={`rounded-[20px] h-auto min-h-12 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-sm group relative ${
                        currentChatId === chat.id ? "bg-gray-100 dark:bg-[#2a2a2a]" : ""
                      }`}
                    >
                      <div className="flex flex-col items-start flex-1 min-w-0 py-2">
                        <span className="truncate w-full text-left font-medium text-gray-900 dark:text-gray-100">
                          {chat.title}
                        </span>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                            {chat.messages.length > 0
                              ? chat.messages[chat.messages.length - 1].content.slice(0, 40) + "..."
                              : "Brak wiadomości"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                            {formatDate(chat.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 dark:hover:bg-[#505050] rounded-md transition-opacity ml-2 flex-shrink-0"
                        aria-label="Usuń rozmowę"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-12 flex items-center px-2 py-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#999999] flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium truncate">Profil</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[180px] rounded-[12px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] shadow-lg p-1"
              >
                <div className="space-y-0.5">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">Ustawienia</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer">
                    <span className="text-sm text-gray-900 dark:text-gray-100">Pomoc</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-[#333]" />

                  <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 rounded-[8px] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] cursor-pointer">
                    <span className="text-sm text-gray-900 dark:text-gray-100">Wyloguj</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </Sidebar>
  )
}
