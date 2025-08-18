import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Download, Upload, FileText, Database, Settings } from "lucide-react"
import useAppStore from "@/store/useAppStore"
import { getSessionIdFromUrl } from "@/lib/utils"
import ImportDialog from "./ImportDialog"
import NotesDialog from "./NotesDialog"

const AnalyticsHeader = ({ showConfiguration, onToggleConfiguration }) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const exportAllData = useAppStore((state) => state.exportAllData)
  const capital = useAppStore((state) => state.accountData.capital)

  // Get session ID from URL
  const sessionId = getSessionIdFromUrl()

  // Format capital for display (default to 100K if not available)
  const formattedCapital = capital ? `${(capital / 1000).toFixed(0)}K` : "100K"

  // Create the header text with dynamic values
  const headerText = `#${sessionId}-2-$${formattedCapital}`

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
      <div className="w-full flex items-center justify-between mb-6 px-2 sm:px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground uppercase">
            {headerText}
          </h1>
        </div>

        <div className="flex items-center gap-2">
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
