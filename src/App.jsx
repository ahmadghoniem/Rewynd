import React, { useState, useEffect } from "react"
import ConfigurationView from "./Configuration"
import AnalyticsView from "./Analytics"

const App = () => {
  const [view, setView] = useState("config") // "config" or "analytics"
  const [challengeConfig, setChallengeConfig] = useState({
    phases: 1,
    profitTargets: { phase1: 10 },
    maxDrawdown: 10,
    dailyDrawdown: 5,
    isTrailing: false
  })

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("challengeConfig")
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setChallengeConfig(parsed)
      } catch (error) {
        console.error("Error loading saved config:", error)
      }
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem("challengeConfig", JSON.stringify(challengeConfig))
      setView("analytics")
    } catch (error) {
      console.error("Error saving config:", error)
    }
  }

  const handleBack = () => {
    setView("config")
  }

  return (
    <div className="min-w-[320px] max-w-sm bg-gray-50 p-4">
      {view === "config" ? (
        <ConfigurationView
          config={challengeConfig}
          onSave={handleSave}
          onConfigChange={setChallengeConfig}
        />
      ) : (
        <AnalyticsView config={challengeConfig} onBack={handleBack} />
      )}
    </div>
  )
}

export default App
