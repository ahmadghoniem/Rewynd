import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Minus,
  Target,
  TrendingDown,
  Calendar,
  Check,
  X,
  Image,
  Settings
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import "../hideNumberArrows.css"
import useAppStore from "../store/useAppStore"

// Common button styles
const buttonStyles =
  "h-8 w-8 p-0 bg-transparent border-none shadow-none hover:bg-muted-foreground"

const NumberInput = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = ""
}) => {
  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        onClick={handleDecrement}
        disabled={value <= min}
        className={buttonStyles}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="flex-1 relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const newValue = Math.max(
              min,
              Math.min(max, parseFloat(e.target.value) || 0)
            )
            onChange(newValue)
          }}
          className="text-center pr-8"
          min={min}
          max={max}
          step={step}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
          {suffix}
        </span>
      </div>
      <Button
        variant="ghost"
        onClick={handleIncrement}
        disabled={value >= max}
        className={buttonStyles}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

const PhaseSelector = ({ phases, onChange }) => {
  return (
    <div className="flex space-x-2 justify-center">
      {[1, 2, 3].map((phase) => (
        <Button
          key={phase}
          variant={phases === phase ? "default" : "outline"}
          onClick={() => onChange(phase)}
          className="flex-1 min-w-[80px] font-semibold px-0"
        >
          {phase} Phase{phase > 1 ? "s" : ""}
        </Button>
      ))}
    </div>
  )
}

const DrawdownTypeSelector = ({ value, onChange }) => (
  <div className="flex space-x-2 justify-center">
    {["static", "trailing"].map((type) => (
      <Button
        key={type}
        variant={value === type ? "default" : "outline"}
        onClick={() => onChange(type)}
        className="flex-1 min-w-[80px] font-semibold px-0 capitalize"
      >
        {type}
      </Button>
    ))}
  </div>
)

const StepIndicator = ({ step, currentStep, title, isCompleted }) => {
  const isActive = currentStep === step
  const isPast = currentStep > step

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200">
        {isCompleted || isPast ? (
          <Check className="h-4 w-4 text-primary" />
        ) : (
          <span
            className={`text-sm font-medium ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {step}
          </span>
        )}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {title}
      </span>
    </div>
  )
}

const ConfigurationDialog = ({ onSave }) => {
  const [open, setOpen] = useState(false)
  const [currentPhase, setCurrentPhase] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [presets, setPresets] = useState([])

  // Consolidated preset form state
  const [presetForm, setPresetForm] = useState({
    isOpen: false,
    name: "",
    image: null,
    isSaving: false,
    isSaved: false
  })
  const config = useAppStore((state) => state.config)
  const setConfig = useAppStore((state) => state.setConfig)
  const savePreset = useAppStore((state) => state.savePreset)
  const loadPresets = useAppStore((state) => state.loadPresets)
  const deletePreset = useAppStore((state) => state.deletePreset)

  // Helper function to update a single config field
  const updateConfigField = (field, value) => {
    setConfig({
      ...config,
      [field]: value
    })
  }

  // Helper function to update profit target for a specific phase
  const updateProfitTarget = (phase, value) => {
    setConfig({
      ...config,
      profitTargets: {
        ...config.profitTargets,
        [phase]: value
      }
    })
  }

  const handlePhasesChange = (newPhases) => {
    const defaultProfitTargets =
      config.defaults.profitTargets[newPhases] ||
      config.defaults.profitTargets[1]
    setConfig({
      ...config,
      phases: newPhases,
      profitTargets: defaultProfitTargets
    })
  }

  // Common error handler
  const handleError = (operation, error) => {
    console.error(`Error ${operation}:`, error)
  }

  const renderProfitTargets = () => {
    const targets = []
    for (let i = 1; i <= config.phases; i++) {
      const phaseKey = `phase${i}`
      const targetValue = config.profitTargets[phaseKey]
      targets.push(
        <div key={i} className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">
            Phase {i} Profit Target
          </Label>
          <NumberInput
            value={targetValue}
            onChange={(value) => updateProfitTarget(phaseKey, value)}
            min={1}
            max={50}
            step={1}
            suffix="%"
          />
        </div>
      )
    }
    return targets
  }

  const handleSave = async () => {
    try {
      await onSave()
    } catch (error) {
      console.error("Error saving config:", error)
    }
    setOpen(false)
  }

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Choose Your Challenge</h3>
              <p className="text-sm text-muted-foreground">
                Start with a preset or create a custom configuration
              </p>
            </div>

            <div className="space-y-4">
              {presets.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Saved Presets
                  </Label>
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.name}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedPreset === preset.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => {
                          if (selectedPreset === preset.name) {
                            setSelectedPreset(null)
                          } else {
                            setSelectedPreset(preset.name)
                            setConfig(preset.config)
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {preset.image ? (
                              <img
                                src={preset.image}
                                alt={preset.name}
                                className="w-6 h-6 rounded object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                                <Target className="h-3 w-3 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {preset.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {preset.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {selectedPreset === preset.name && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) =>
                                handleDeletePreset(preset.name, e)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      No saved presets yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create a custom configuration and save it as a preset to
                      get started
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Or Create Custom
                </Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedPreset("custom")
                    setCurrentPhase(1)
                  }}
                >
                  Start with Default Settings
                </Button>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Challenge Phases</h3>
              <p className="text-sm text-muted-foreground">
                Configure the number of phases and profit targets
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Number of Phases
                </Label>
                <PhaseSelector
                  phases={config.phases}
                  onChange={handlePhasesChange}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">
                  Profit Targets
                </Label>
                {renderProfitTargets()}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <TrendingDown className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Drawdown Settings</h3>
              <p className="text-sm text-muted-foreground">
                Set your daily and maximum drawdown limits
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Daily Drawdown
                </Label>
                <NumberInput
                  value={config.dailyDrawdown}
                  onChange={(value) =>
                    updateConfigField("dailyDrawdown", value)
                  }
                  min={1}
                  max={50}
                  step={1}
                  suffix="%"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Max Drawdown
                </Label>
                <NumberInput
                  value={config.maxDrawdown}
                  onChange={(value) => updateConfigField("maxDrawdown", value)}
                  min={1}
                  max={50}
                  step={1}
                  suffix="%"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Max Drawdown Type
                </Label>
                <DrawdownTypeSelector
                  value={config.maxDrawdownType}
                  onChange={(type) =>
                    updateConfigField("maxDrawdownType", type)
                  }
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-lg font-semibold">Trading Days</h3>
              <p className="text-sm text-muted-foreground">
                Set minimum trading and profitable day requirements
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Profitable Days
                </Label>
                <NumberInput
                  value={config.requireProfitableDays}
                  onChange={(value) =>
                    updateConfigField(
                      "requireProfitableDays",
                      Math.max(0, value)
                    )
                  }
                  min={0}
                  max={30}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Minimum Trading Days
                </Label>
                <NumberInput
                  value={config.minTradingDays}
                  onChange={(value) =>
                    updateConfigField("minTradingDays", Math.max(0, value))
                  }
                  min={0}
                  max={30}
                  step={1}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Load presets on component mount
  React.useEffect(() => {
    const loadPresetsData = async () => {
      try {
        const presetsData = await loadPresets()
        setPresets(presetsData)
      } catch (error) {
        handleError("loading presets", error)
      }
    }
    loadPresetsData()
  }, [loadPresets])

  // Reset preset form state when dialog opens or phase changes
  React.useEffect(() => {
    if (open) {
      setPresetForm({
        isOpen: false,
        name: "",
        image: null,
        isSaving: false,
        isSaved: false
      })
    }
  }, [open, currentPhase])

  const savePresetToStorage = async (presetData) => {
    try {
      const success = await savePreset(presetData)
      if (success) {
        // Update local state instead of reloading all presets
        setPresets((prev) => [...prev, presetData])
      }
      return success
    } catch (error) {
      handleError("saving preset", error)
      return false
    }
  }

  const handleDeletePreset = async (presetName, event) => {
    event.stopPropagation() // Prevent triggering preset selection
    if (window.confirm(`Are you sure you want to delete "${presetName}"?`)) {
      try {
        const success = await deletePreset(presetName)
        if (success) {
          // Update local state instead of reloading all presets
          setPresets((prev) => prev.filter((p) => p.name !== presetName))
          // Clear selection if deleted preset was selected
          if (selectedPreset === presetName) {
            setSelectedPreset(null)
          }
        }
      } catch (error) {
        handleError("deleting preset", error)
      }
    }
  }

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

  const steps = [
    { step: 0, title: "Choose Challenge" },
    { step: 1, title: "Challenge Phases" },
    { step: 2, title: "Drawdown Settings" },
    { step: 3, title: "Trading Days" }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-card bg-card p-0">
        <DialogHeader className="px-4 pt-6 pb-4">
          <DialogTitle className="text-center">
            Challenge Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="flex">
          {/* Left Sidebar - Step Indicators */}
          <div className="w-60 border-r border-border p-4 space-y-3">
            <div className="space-y-2">
              {steps.map((stepInfo) => (
                <div
                  key={stepInfo.step}
                  className={`cursor-pointer transition-all duration-200 ${
                    currentPhase === stepInfo.step
                      ? "bg-muted/50 rounded-lg p-2"
                      : "hover:bg-muted/30 rounded-lg p-2"
                  }`}
                  onClick={() => setCurrentPhase(stepInfo.step)}
                >
                  <StepIndicator
                    step={stepInfo.step}
                    currentStep={currentPhase}
                    title={stepInfo.title}
                    isCompleted={currentPhase > stepInfo.step}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-4">
            <div className="max-w-sm mx-auto">{renderPhaseContent()}</div>
          </div>
        </div>

        <DialogFooter className="px-4 pb-6">
          <div className="flex items-center justify-between w-full">
            {/* Save Preset Section - Left Side */}
            {currentPhase === 3 &&
              (presetForm.isSaved ? (
                <Button disabled>Saved</Button>
              ) : presetForm.isOpen ? (
                <div className="flex items-center space-x-2">
                  {/* Icon Selector */}
                  <div className="flex items-center space-x-0">
                    <div className="relative">
                      <div
                        className="w-9 h-9 rounded-md bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() =>
                          document.getElementById("image-picker").click()
                        }
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
                      {selectedImage && (
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
                    onClick={async () => {
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
                        handleError("saving preset", error)
                      } finally {
                        setPresetForm((prev) => ({ ...prev, isSaving: false }))
                      }
                    }}
                    disabled={!presetForm.name.trim() || presetForm.isSaving}
                  >
                    {presetForm.isSaving ? "Saving..." : "Save"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setPresetForm({
                        isOpen: false,
                        name: "",
                        image: null,
                        isSaving: false,
                        isSaved: false
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() =>
                    setPresetForm((prev) => ({ ...prev, isOpen: true }))
                  }
                >
                  Save as Preset
                </Button>
              ))}

            {/* Navigation Buttons - Right Side */}
            <div className="flex items-center space-x-2 ml-auto">
              <div className="h-9 w-px bg-divider mx-2" />
              <Button
                variant="outline"
                onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
                disabled={currentPhase === 0}
              >
                Previous
              </Button>

              {currentPhase === 0 ? (
                <Button
                  onClick={() => {
                    if (selectedPreset && selectedPreset !== "custom") {
                      // If a preset is selected, finalize configuration and close dialog
                      handleSave()
                    } else {
                      // If custom is selected, go to step 1
                      setCurrentPhase(1)
                    }
                  }}
                  disabled={!selectedPreset}
                >
                  Continue
                </Button>
              ) : currentPhase < 3 ? (
                <Button onClick={() => setCurrentPhase(currentPhase + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSave}>Save Configuration</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfigurationDialog
