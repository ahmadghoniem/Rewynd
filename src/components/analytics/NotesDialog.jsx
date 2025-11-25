import React, { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import useAppStore from "@/store/useAppStore"
import RichTextEditor from "../editor/RichTextEditor"

const NotesDialog = ({ open, onOpenChange }) => {
  const [tempNotes, setTempNotes] = useState(null)

  const notes = useAppStore((state) => state.notes)
  const saveNotes = useAppStore((state) => state.saveNotes)

  // Load current notes when dialog opens
  useEffect(() => {
    if (open) {
      try {
        // Try to parse notes as JSON (Lexical format)
        if (notes && notes.trim() !== "") {
          const parsedNotes = JSON.parse(notes)
          // Validate that it has a proper Lexical structure
          if (parsedNotes && parsedNotes.root) {
            setTempNotes(parsedNotes)
          } else {
            setTempNotes(null)
          }
        } else {
          setTempNotes(null)
        }
      } catch (error) {
        // If parsing fails, start with empty editor
        console.log("Failed to parse notes, starting with empty editor:", error)
        setTempNotes(null)
      }
    }
  }, [open, notes])

  // Auto-save function
  const autoSave = async (notes) => {
    try {
      const notesToSave = notes ? JSON.stringify(notes) : ""
      await saveNotes(notesToSave)
    } catch (error) {
      console.error("Error auto-saving notes:", error)
    }
  }

  // Handle notes change with auto-save
  const handleNotesChange = (notes) => {
    setTempNotes(notes)
    // Auto-save after a short delay
    setTimeout(() => {
      autoSave(notes)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] min-h-[70vh] p-0 border border-accent">
        <div className="h-full">
          <RichTextEditor
            initialValue={tempNotes}
            onChange={(newNotes) => handleNotesChange(newNotes)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotesDialog
