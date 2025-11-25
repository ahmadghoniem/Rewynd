import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Download, Upload, FileJson } from "lucide-react"
import useAppStore from "@/store/useAppStore"

const SessionDataManager = ({ sessionId }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const fileInputRef = useRef(null)

  const exportAllData = useAppStore((state) => state.exportAllData)
  const importAllData = useAppStore((state) => state.importAllData)

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
      const shortSessionId = sessionId ? sessionId.slice(-8) : "unknown"
      link.download = `rewynd-${shortSessionId}-${timestamp}.json`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export session data. Please try again.")
    }
  }

  const handleImport = () => {
    setDropdownOpen(false)
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // Basic validation
        if (
          !data.exportMetadata ||
          !data.challengeConfig ||
          !data.sessionData ||
          !data.tradeData
        ) {
          alert("Invalid file format. Missing required data sections.")
          return
        }

        // Import the data
        const success = await importAllData(data)
        if (success) {
          alert("Session data imported successfully!")
        } else {
          alert("Failed to import session data. Please try again.")
        }
      } catch (err) {
        console.error("Import error:", err)
        alert("Invalid JSON file or unsupported format.")
      }
    }

    reader.readAsText(file)

    // Reset file input to allow importing the same file again
    event.target.value = ""
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium"
          >
            <FileJson className="h-3 w-3 mr-1.5" />
            Import/Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="h-3 w-3 mr-2" />
            Import Session Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-3 w-3 mr-2" />
            Export Session data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </>
  )
}

export default SessionDataManager
