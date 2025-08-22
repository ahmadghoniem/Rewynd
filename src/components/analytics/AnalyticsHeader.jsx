import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

/* eslint-disable no-undef */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Download,
  Upload,
  FileText,
  Database,
  Settings,
  RefreshCw
} from "lucide-react"
import useAppStore from "@/store/useAppStore"
import ImportDialog from "./ImportDialog"
import NotesDialog from "./NotesDialog"
import StatusBadge from "@/components/ui/status-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"

const AnalyticsHeader = ({ showConfiguration, onToggleConfiguration }) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [pendingSessionChange, setPendingSessionChange] = useState(null)
  const exportAllData = useAppStore((state) => state.exportAllData)
  const capital = useAppStore((state) => state.sessionData.capital)
  const objectives = useAppStore((state) => state.objectives)
  const sessionData = useAppStore((state) => state.sessionData)
  const switchToNewSession = useAppStore((state) => state.switchToNewSession)

  // Get session ID from global state
  const sessionId = sessionData?.id || "unknown"

  // Format capital for display (default to 100K if not available)
  const formattedCapital = capital ? `${(capital / 1000).toFixed(0)}K` : "100K"

  // Create the header text with dynamic values
  // Use last 8 characters of session ID for cleaner display
  const shortSessionId = sessionId ? sessionId.slice(-8) : "unknown"
  const headerText = `#${shortSessionId}-2-$${formattedCapital}`

  // Calculate badge status based on objectives
  const getBadgeStatus = () => {
    // Check if all trading objectives are met
    const allObjectivesMet =
      objectives.minimumTradingDays &&
      objectives.minimumProfitableDays &&
      objectives.profitTargets &&
      objectives.consistencyRule &&
      objectives.dailyDrawdown &&
      objectives.maxDrawdown

    // Check if any breaking rules are violated (excluding consistency rule)
    // Only maxDailyLossBroken and maxStaticLossBroken cause failure
    const anyBreakingRulesViolated =
      objectives.maxDailyLossBroken || objectives.maxStaticLossBroken

    if (allObjectivesMet) {
      return "funded"
    } else if (anyBreakingRulesViolated) {
      return "failed"
    } else {
      return "in-progress"
    }
  }

  // Get current badge status
  const badgeStatus = getBadgeStatus()

  // Check for session changes when component loads and periodically
  useEffect(() => {
    const checkSessionChange = async () => {
      const currentSessionId = sessionData?.id

      // Get session ID from the active FxReplay tab
      let urlSessionId = null
      try {
        if (chrome?.tabs) {
          const [fxReplayTab] = await chrome.tabs.query({
            url: "https://app.fxreplay.com/en-US/auth/chart/*"
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
          newSessionId: urlSessionId,
          newSessionData: {
            id: urlSessionId,
            balance: null,
            realizedPnL: null,
            capital: null,
            lastUpdated: Date.now()
          }
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

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      const timestamp = new Date().toISOString().split("T")[0]
      link.download = `fxreplay-export-${timestamp}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data. Please try again.")
    }
  }

  const handleImportClick = () => {
    setDropdownOpen(false)
    setImportDialogOpen(true)
  }

  const handleSwitchSession = async () => {
    if (pendingSessionChange) {
      try {
        await switchToNewSession(pendingSessionChange.newSessionData)
        setPendingSessionChange(null)
        // Data is now refreshed automatically, no need to reload
      } catch (error) {
        console.error("Error switching session:", error)
        alert("Failed to switch session. Please try again.")
      }
    }
  }

  return (
    <>
      <div className="w-full flex items-center justify-between mb-6 ">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-foreground uppercase">
            {headerText}
          </h1>
          <StatusBadge status={badgeStatus} />
        </div>

        <div className="flex items-center gap-2">
          {pendingSessionChange && (
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
                    Current:{" "}
                    {pendingSessionChange.currentSessionId?.slice(-8) || "None"}
                  </div>
                  <div>New: {pendingSessionChange.newSessionId?.slice(-8)}</div>
                  <div className="text-muted-foreground mt-1">
                    This will clear all current data
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotesDialogOpen(true)}
            className="h-8 px-3 text-xs font-medium"
          >
            <FileText className="h-3 w-3 mr-1.5" />
            Notes
          </Button>

          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium"
              >
                <Database className="h-3 w-3 mr-1.5" />
                Import/Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImportClick}>
                <Upload className="h-3 w-3 mr-2" />
                Import Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-3 w-3 mr-2" />
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showConfiguration ? "default" : "outline"}
            size="sm"
            onClick={onToggleConfiguration}
            className="h-8 px-3 text-xs font-medium"
          >
            <Settings className="h-3 w-3 mr-1.5" />
            Configuration
          </Button>
        </div>
      </div>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <NotesDialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen} />
    </>
  )
}

export default AnalyticsHeader
