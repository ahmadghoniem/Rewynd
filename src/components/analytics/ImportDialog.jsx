import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Upload, FileText, AlertCircle } from "lucide-react"
import useAppStore from "@/store/useAppStore"

const ImportDialog = ({ open, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [importData, setImportData] = useState(null)
  const [error, setError] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  const importAllData = useAppStore((state) => state.importAllData)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setError(null)
    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // Basic validation
        if (
          !data.exportMetadata ||
          !data.challengeConfig ||
          !data.sessionData ||
          !data.tradeData
        ) {
          throw new Error(
            "Invalid file format. Missing required data sections."
          )
        }

        setImportData(data)
        setError(null)
      } catch (err) {
        setError("Invalid JSON file or unsupported format.")
        setImportData(null)
      }
    }

    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!importData) return

    setIsImporting(true)
    try {
      const success = await importAllData(importData)
      if (success) {
        onOpenChange(false)
        // Reset state
        setSelectedFile(null)
        setImportData(null)
        setError(null)
      } else {
        setError("Failed to import data. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during import.")
      console.error("Import error:", err)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedFile(null)
    setImportData(null)
    setError(null)
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-card bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </DialogTitle>
          <DialogDescription>
            Import previously exported FxReplay data. This will replace all
            current data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">
                Choose a JSON file to import
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">Select File</span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                  </span>
                </div>

                {importData && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Exported:{" "}
                      {formatDate(importData.exportMetadata.exportDate)}
                    </div>
                    <div>Trades: {importData.tradeData.length}</div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  setImportData(null)
                  setError(null)
                }}
                className="w-full"
              >
                Choose Different File
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!importData || isImporting}
            className="min-w-[80px]"
          >
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportDialog
