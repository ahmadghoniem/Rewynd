import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import useAppStore from "@/store/useAppStore"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

const SessionChangeManager = ({ sessionData }) => {
  const [pendingSessionChange, setPendingSessionChange] = useState(null)
  const switchToNewSession = useAppStore((state) => state.switchToNewSession)

  // Check for session changes when component loads and periodically
  useEffect(() => {
    const checkSessionChange = async () => {
      const currentSessionId = sessionData?.id

      // Get session ID from the active FxReplay tab
      let urlSessionId = null
      try {
        if (chrome?.tabs) {
          const [fxReplayTab] = await chrome.tabs.query({
            url: "https://app.fxreplay.com/*/auth/testing/chart/*"
          })
          if (fxReplayTab) {
            const pathSegments = fxReplayTab.url.split("/")
            urlSessionId = pathSegments[pathSegments.length - 1]
          }
        }
      } catch (error) {
        console.error("Error getting FxReplay tab URL:", error)
      }

      if (
        currentSessionId &&
        urlSessionId &&
        currentSessionId !== urlSessionId
      ) {
        // Session has changed - show switch button
        setPendingSessionChange({
          currentSessionId,
          newSessionId: urlSessionId
        })
      } else if (
        currentSessionId &&
        urlSessionId &&
        currentSessionId === urlSessionId
      ) {
        // Session is the same - clear any pending change
        setPendingSessionChange(null)
      }
    }

    // Check immediately and also when sessionData changes
    checkSessionChange()

    // Set up periodic check every 2 seconds while popup is open
    const interval = setInterval(checkSessionChange, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [sessionData?.id])

  const handleSwitchSession = async () => {
    if (pendingSessionChange) {
      try {
        await switchToNewSession(pendingSessionChange.newSessionId)
        setPendingSessionChange(null)
        // Data is now refreshed automatically, no need to reload
      } catch (error) {
        console.error("Error switching session:", error)
        alert("Failed to switch session. Please try again.")
      }
    }
  }

  if (!pendingSessionChange) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleSwitchSession}
          className="h-8 px-3 text-xs font-medium"
        >
          <RefreshCw className="h-3 w-3 mr-1.5" />
          Switch to New Session
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div>
            Current: #
            {pendingSessionChange.currentSessionId?.slice(-8).toUpperCase() ||
              "NONE"}
          </div>
          <div>
            New: #{pendingSessionChange.newSessionId?.slice(-8).toUpperCase()}
          </div>
          <div className="text-muted-foreground mt-1">
            This will clear all current data
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export default SessionChangeManager
