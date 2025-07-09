"use client"

import * as React from "react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = React.useState(true)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    // Check if app is installed and in fullscreen mode
    const checkDisplayMode = () => {
      const isFullscreenMode = window.matchMedia("(display-mode: fullscreen)").matches
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches

      setIsFullscreen(isFullscreenMode)
      setIsInstalled(isFullscreenMode || isStandaloneMode)
    }

    checkDisplayMode()

    // Network status detection
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    // Service Worker registration with enhanced update handling
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)

            // Check for updates every 30 seconds when online
            setInterval(() => {
              if (navigator.onLine) {
                registration.update()
              }
            }, 30000)

            // Handle updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Auto-update in fullscreen PWA mode
                    if (isFullscreen) {
                      newWorker.postMessage({ type: "SKIP_WAITING" })
                      setTimeout(() => window.location.reload(), 1000)
                    } else {
                      // Show update prompt for browser users
                      if (confirm("New version available! Refresh to update?")) {
                        newWorker.postMessage({ type: "SKIP_WAITING" })
                        window.location.reload()
                      }
                    }
                  }
                })
              }
            })
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }

    // Handle app updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload()
      })
    }

    // Enhanced touch behaviors for fullscreen PWA
    if (isFullscreen || isInstalled) {
      // Prevent double-tap zoom
      let lastTouchEnd = 0
      document.addEventListener(
        "touchend",
        (e) => {
          const now = new Date().getTime()
          if (now - lastTouchEnd <= 300) {
            e.preventDefault()
          }
          lastTouchEnd = now
        },
        false,
      )

      // Prevent pinch zoom
      document.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length > 1) {
            e.preventDefault()
          }
        },
        { passive: false },
      )

      document.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length > 1) {
            e.preventDefault()
          }
        },
        { passive: false },
      )

      // Prevent context menu
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault()
      })

      // Prevent pull-to-refresh
      document.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 1 && window.scrollY === 0) {
            e.preventDefault()
          }
        },
        { passive: false },
      )
    }

    // Handle viewport changes for fullscreen
    const handleViewportChange = () => {
      const viewport = document.querySelector("meta[name=viewport]")
      if (viewport) {
        if (isFullscreen) {
          viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content",
          )
        } else {
          viewport.setAttribute(
            "content",
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
          )
        }
      }

      // Handle safe areas
      document.documentElement.style.setProperty(
        "--safe-area-inset-top",
        isFullscreen ? "env(safe-area-inset-top)" : "0px",
      )
      document.documentElement.style.setProperty(
        "--safe-area-inset-bottom",
        isFullscreen ? "env(safe-area-inset-bottom)" : "0px",
      )
    }

    handleViewportChange()
    window.addEventListener("orientationchange", handleViewportChange)
    window.addEventListener("resize", handleViewportChange)

    // Background sync registration
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.sync.register("background-sync")
        })
        .catch((err) => {
          console.log("Background sync registration failed:", err)
        })
    }

    // Notification permission for PWA
    if (isInstalled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
      window.removeEventListener("orientationchange", handleViewportChange)
      window.removeEventListener("resize", handleViewportChange)
    }
  }, [isFullscreen, isInstalled])

  // Show network status for PWA
  React.useEffect(() => {
    if (isInstalled) {
      const existingStatus = document.getElementById("network-status")
      if (existingStatus) {
        existingStatus.remove()
      }

      if (!isOnline) {
        const statusDiv = document.createElement("div")
        statusDiv.id = "network-status"
        statusDiv.className = "network-status offline"
        statusDiv.textContent = "📡 Offline Mode"
        document.body.appendChild(statusDiv)

        setTimeout(() => {
          statusDiv.remove()
        }, 3000)
      }
    }
  }, [isOnline, isInstalled])

  return <>{children}</>
}
