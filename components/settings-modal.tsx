"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { aiModels } from "@/lib/constants"
import { Trash2, Moon, Sun, Monitor, User, Settings, Database, Bot, Shield, Bell, X } from "lucide-react"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Theme = "light" | "dark" | "system"
type SettingsSection = "general" | "models" | "data" | "account" | "privacy" | "notifications"

const settingsSections = [
  { id: "general" as const, label: "Ogólne", icon: Settings },
  { id: "models" as const, label: "Modele AI", icon: Bot },
  { id: "data" as const, label: "Dane", icon: Database },
  { id: "account" as const, label: "Konto", icon: User },
  { id: "privacy" as const, label: "Prywatność", icon: Shield },
  { id: "notifications" as const, label: "Powiadomienia", icon: Bell },
]

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = React.useState<SettingsSection>("general")
  const [theme, setTheme] = React.useState<Theme>("system")
  const [defaultModel, setDefaultModel] = React.useState("gemini-1.5-pro")
  const [enabledModels, setEnabledModels] = React.useState<Record<string, boolean>>({
    "gemini-1.5-pro": true,
    "gemini-2.5-flash": true,
    "gemini-2.0-flash": true,
  })
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Load settings on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = (localStorage.getItem("theme") as Theme) || "system"
      const savedDefaultModel = localStorage.getItem("defaultModel") || "gemini-1.5-pro"
      const savedEnabledModels = localStorage.getItem("enabledModels")

      setTheme(savedTheme)
      setDefaultModel(savedDefaultModel)

      if (savedEnabledModels) {
        try {
          setEnabledModels(JSON.parse(savedEnabledModels))
        } catch (error) {
          console.error("Error parsing enabled models:", error)
        }
      }
    }
  }, [])

  // Apply theme changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme)

      const root = window.document.documentElement
      root.classList.remove("light", "dark")

      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const handleDefaultModelChange = (modelId: string) => {
    setDefaultModel(modelId)
    localStorage.setItem("defaultModel", modelId)
  }

  const handleModelToggle = (modelId: string, enabled: boolean) => {
    const newEnabledModels = { ...enabledModels, [modelId]: enabled }
    setEnabledModels(newEnabledModels)
    localStorage.setItem("enabledModels", JSON.stringify(newEnabledModels))
  }

  const handleDeleteAllChats = async () => {
    if (isDeleting) return

    const confirmed = window.confirm("Czy na pewno chcesz usunąć wszystkie czaty? Ta akcja jest nieodwracalna.")

    if (!confirmed) return

    setIsDeleting(true)

    try {
      localStorage.removeItem("gpt-ui-chats")
      localStorage.removeItem("gpt-ui-current-chat")
      window.dispatchEvent(new CustomEvent("chats-updated"))
      alert("Wszystkie czaty zostały usunięte.")
      onOpenChange(false)
    } catch (error) {
      console.error("Error deleting chats:", error)
      alert("Wystąpił błąd podczas usuwania czatów.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = () => {
    const confirmed = window.confirm("Czy na pewno chcesz się wylogować?")
    if (confirmed) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const getThemeIcon = (themeType: Theme) => {
    switch (themeType) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      case "system":
        return <Monitor className="w-4 h-4" />
    }
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Motyw</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Wybierz wygląd aplikacji</p>
                </div>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="w-32 rounded-lg">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme)}
                        <span className="text-sm">
                          {theme === "system" ? "System" : theme === "light" ? "Jasny" : "Ciemny"}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        <span>Jasny</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        <span>Ciemny</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case "models":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Domyślny model</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Model używany w nowych rozmowach</p>
                </div>
                <Select value={defaultModel} onValueChange={handleDefaultModelChange}>
                  <SelectTrigger className="w-40 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels
                      .filter((model) => enabledModels[model.id])
                      .map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="mb-3">
                <Label className="text-sm font-medium text-gray-900 dark:text-white">Dostępne modele</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Włącz lub wyłącz modele AI</p>
              </div>
              <div className="space-y-1">
                {aiModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <div>
                      <Label className="text-sm font-medium text-gray-900 dark:text-white">{model.name}</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{model.provider}</p>
                    </div>
                    <Switch
                      checked={enabledModels[model.id] || false}
                      onCheckedChange={(checked) => handleModelToggle(model.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "data":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Usuń wszystkie czaty</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trwale usuń całą historię rozmów</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDeleteAllChats}
                  disabled={isDeleting}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] bg-transparent rounded-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Usuwanie..." : "Usuń"}
                </Button>
              </div>
            </div>
          </div>
        )

      case "account":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Użytkownik</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Konto lokalne</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Wylogowanie</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Wyczyść wszystkie dane</p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] bg-transparent rounded-lg"
                >
                  Wyloguj
                </Button>
              </div>
            </div>
          </div>
        )

      case "privacy":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Ochrona danych</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-3">
                Wszystkie dane są przechowywane lokalnie w Twojej przeglądarce.
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Rozmowy nie są wysyłane na nasze serwery</li>
                <li>• Dane nie są udostępniane stronom trzecim</li>
                <li>• Możesz usunąć dane w każdej chwili</li>
              </ul>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-200 dark:border-[#333] shadow-lg">
              <Label className="text-sm font-medium text-gray-900 dark:text-white">Funkcja w przygotowaniu</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Ustawienia powiadomień będą dostępne w przyszłych aktualizacjach.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl p-0 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Ustawienia</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-[#333]">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? "bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-hide">{renderSectionContent()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#333] flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg px-4 py-2"
          >
            Gotowe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
