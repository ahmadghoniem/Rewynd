import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"
import useAppStore from "@/store/useAppStore"
import ImportDialog from "./ImportDialog"

const AnalyticsHeader = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const exportAllData = useAppStore((state) => state.exportAllData)

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

  return (
    <>
      <div className="w-full flex items-center justify-between mb-6 px-2 sm:px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground">
            Hello, Trader
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-8 px-3 text-xs font-medium"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            className="h-8 px-3 text-xs font-medium"
          >
            <Upload className="h-3 w-3 mr-1.5" />
            Import Data
          </Button>
        </div>
      </div>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </>
  )
}

export default AnalyticsHeader
