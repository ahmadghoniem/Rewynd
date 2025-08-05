import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Target, X } from "lucide-react"
import useAppStore from "../store/useAppStore"

const PresetSaver = ({ config, onPresetSaved }) => {
  const [presetForm, setPresetForm] = useState({
    isOpen: false,
    name: "",
    image: null,
    isSaving: false,
    isSaved: false
  })

  const savePreset = useAppStore((state) => state.savePreset)

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPresetForm((prev) => ({ ...prev, image: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const savePresetToStorage = async (presetData) => {
    try {
      const success = await savePreset(presetData)
      if (success) {
        onPresetSaved && onPresetSaved(presetData)
      }
      return success
    } catch (error) {
      console.error("Error saving preset:", error)
      return false
    }
  }

  const handleSavePreset = async () => {
    setPresetForm((prev) => ({ ...prev, isSaving: true }))
    try {
      const presetData = {
        name: presetForm.name,
        config: config,
        image: presetForm.image,
        createdAt: new Date().toISOString()
      }

      const success = await savePresetToStorage(presetData)

      if (success) {
        setPresetForm({
          isOpen: false,
          name: "",
          image: null,
          isSaving: false,
          isSaved: true
        })
      } else {
        console.error("Failed to save preset")
      }
    } catch (error) {
      console.error("Error saving preset:", error)
    } finally {
      setPresetForm((prev) => ({ ...prev, isSaving: false }))
    }
  }

  const handleCancel = () => {
    setPresetForm({
      isOpen: false,
      name: "",
      image: null,
      isSaving: false,
      isSaved: false
    })
  }

  const handleOpenForm = () => {
    setPresetForm((prev) => ({ ...prev, isOpen: true }))
  }

  if (presetForm.isSaved) {
    return <Button disabled>Saved</Button>
  }

  if (presetForm.isOpen) {
    return (
      <div className="flex items-center space-x-2">
        {/* Icon Selector */}
        <div className="flex items-center space-x-0">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-md bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
              onClick={() => document.getElementById("image-picker").click()}
            >
              {presetForm.image ? (
                <img
                  src={presetForm.image}
                  alt="Selected"
                  className="w-9 h-9 rounded-md object-cover"
                />
              ) : (
                <Target className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            {presetForm.image && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-1 -right-1 h-4 w-4 p-0 hover:text-destructive"
                onClick={() =>
                  setPresetForm((prev) => ({ ...prev, image: null }))
                }
              >
                <X className="h-2 w-2" />
              </Button>
            )}
          </div>
          <input
            id="image-picker"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Preset Name Input */}
        <Input
          placeholder="Preset name..."
          value={presetForm.name}
          onChange={(e) =>
            setPresetForm((prev) => ({
              ...prev,
              name: e.target.value
            }))
          }
          className="w-44"
          disabled={presetForm.isSaving}
        />

        {/* Save/Cancel Buttons */}
        <Button
          onClick={handleSavePreset}
          disabled={!presetForm.name.trim() || presetForm.isSaving}
        >
          {presetForm.isSaving ? "Saving..." : "Save"}
        </Button>

        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" onClick={handleOpenForm}>
      Save as Preset
    </Button>
  )
}

export default PresetSaver
