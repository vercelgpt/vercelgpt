"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Wifi, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isFullscreen = window.matchMedia("(display-mode: fullscreen)").matches
      setIsInstalled(isStandalone || isFullscreen)
    }

    checkInstalled()

    // Network status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      console.log("Pełnoekranowa PWA została zainstalowana")
      setShowInstallButton(false)
      setDeferredPrompt(null)
      setIsInstalled(true)

      // Show success message
      const successDiv = document.createElement("div")
      successDiv.className = "network-status online"
      successDiv.textContent = "📱 Aplikacja zainstalowana! Uruchom ponownie dla pełnego ekranu"
      successDiv.style.top = "20px"
      document.body.appendChild(successDiv)

      setTimeout(() => {
        successDiv.remove()
      }, 5000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("Użytkownik zaakceptował instalację pełnoekranowej PWA")
    } else {
      console.log("Użytkownik odrzucił instalację pełnoekranowej PWA")
    }

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // Don't show if already installed
  if (!showInstallButton || isInstalled) {
    return null
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50 shadow-lg bg-white dark:bg-gray-800 border-2 animate-pulse"
    >
      <Smartphone className="w-4 h-4 mr-2" />
      <Wifi className={`w-3 h-3 mr-1 ${isOnline ? "text-green-500" : "text-red-500"}`} />
      Zainstaluj Pełnoekranowo
    </Button>
  )
}
