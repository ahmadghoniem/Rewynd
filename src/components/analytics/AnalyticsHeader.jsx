import React, { useState } from "react"
import { Button } from "@/components/ui/button"
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
  CheckCircle
} from "lucide-react"
import useAppStore from "@/store/useAppStore"
import { getSessionIdFromUrl } from "@/lib/utils"
import ImportDialog from "./ImportDialog"
import NotesDialog from "./NotesDialog"
import StatusBadge from "@/components/ui/status-badge"

const AnalyticsHeader = ({ showConfiguration, onToggleConfiguration }) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const exportAllData = useAppStore((state) => state.exportAllData)
  const capital = useAppStore((state) => state.accountData.capital)
  const objectives = useAppStore((state) => state.objectives)
  const updateObjective = useAppStore((state) => state.updateObjective)
  const updateBreakingRule = useAppStore((state) => state.updateBreakingRule)

  // Get session ID from URL
  const sessionId = getSessionIdFromUrl()

  // Format capital for display (default to 100K if not available)
  const formattedCapital = capital ? `${(capital / 1000).toFixed(0)}K` : "100K"

  // Create the header text with dynamic values
  const headerText = `#${sessionId}-2-$${formattedCapital}`

  // Test function to set all objectives to true (Funded status)
  const testFundedStatus = () => {
    console.log("Setting all objectives to true for Funded status test")
    updateObjective("minimumTradingDays", true)
    updateObjective("minimumProfitableDays", true)
    updateObjective("profitTargets", true)
    updateObjective("consistencyRule", true)
    updateObjective("dailyDrawdown", true)
    updateObjective("maxDrawdown", true)
    updateBreakingRule("maxDailyLossBroken", false)
    updateBreakingRule("maxStaticLossBroken", false)
    updateBreakingRule("consistencyRuleBroken", false)
  }

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

    console.log("getBadgeStatus:", {
      objectives,
      allObjectivesMet,
      maxDailyLossBroken: objectives.maxDailyLossBroken,
      maxStaticLossBroken: objectives.maxStaticLossBroken,
      anyBreakingRulesViolated,
      result: allObjectivesMet
        ? "funded"
        : anyBreakingRulesViolated
        ? "failed"
        : "in-progress"
    })

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
          <Button
            variant="outline"
            size="sm"
            onClick={testFundedStatus}
            className="h-8 px-3 text-xs font-medium bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            <CheckCircle className="h-3 w-3 mr-1.5" />
            Test Funded
          </Button>

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
