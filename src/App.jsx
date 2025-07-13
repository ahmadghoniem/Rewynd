import React, { useState, useEffect } from "react"
import ConfigurationView from "./configuration"
import AnalyticsView from "./analytics"
import { ThemeProvider } from "./ThemeContext"

const App = () => {
  const [view, setView] = useState("analytics") // "config" or "analytics"
  const [challengeConfig, setChallengeConfig] = useState({
    phases: 1,
    profitTargets: { phase1: 10 },
    maxDrawdown: 10,
    dailyDrawdown: 5,
    isTrailing: false
  })
  
  const [accountData, setAccountData] = useState({
    balance: 5000, // Default fallback
    realizedPnL: 0,
    capital: 5000, // Default fallback
    lastUpdated: null
  })

  // Function to load and update account data
  const loadAndUpdateAccountData = () => {
    try {
      // Try to get data from Chrome extension storage first
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'GET_ACCOUNT_DATA' }, (response) => {
          if (response && response.data) {
            console.log('Loading/updating account data from extension storage:', response.data)
            setAccountData(response.data)
          } else {
            console.log('No account data found in extension storage, trying localStorage')
            // Fallback to localStorage
            const stored = localStorage.getItem('tradeAnalytics_accountData')
            if (stored) {
              const parsedData = JSON.parse(stored)
              console.log('Loading/updating account data from localStorage:', parsedData)
              setAccountData(parsedData)
            } else {
              console.log('No account data found anywhere')
            }
          }
        })
      } else {
        // Fallback to localStorage if not in extension context
        const stored = localStorage.getItem('tradeAnalytics_accountData')
        console.log('Raw localStorage data:', stored)
        
        if (stored) {
          const parsedData = JSON.parse(stored)
          console.log('Loading/updating account data from localStorage:', parsedData)
          setAccountData(parsedData)
        } else {
          console.log('No account data found in localStorage')
        }
      }
    } catch (error) {
      console.error('Error loading account data:', error)
    }
  }

// Load saved configuration and account data on mount
useEffect(() => {
  // Load challenge configuration
  const savedConfig = localStorage.getItem("challengeConfig")
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig)
      setChallengeConfig(parsed)
    } catch (error) {
      console.error("Error loading saved config:", error)
    }
  }

  // Initial load
  loadAndUpdateAccountData()

  // Set up event listener for real-time updates from website
  const handleAccountUpdate = (event) => {
    const newData = event.detail
    console.log('Event-triggered account update:', newData)
    setAccountData(newData)
  }

  // Set up storage event listener for cross-tab updates
  const handleStorageChange = (event) => {
    if (event.key === 'tradeAnalytics_accountData') {
      console.log('Storage change detected, reloading account data')
      loadAndUpdateAccountData()
    }
  }

  // Set up manual refresh event listener
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered')
    loadAndUpdateAccountData()
  }

  // Set up Chrome extension message listener
  const handleExtensionMessage = (message, sender, sendResponse) => {
    console.log('Extension message received:', message)
    if (message.type === 'ACCOUNT_DATA_UPDATED') {
      console.log('Account data updated via extension:', message.data)
      setAccountData(message.data)
    }
  }

  // Add event listeners
  window.addEventListener('accountDataUpdated', handleAccountUpdate)
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('manualRefresh', handleManualRefresh)
  
  // Add Chrome extension message listener if available
  if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleExtensionMessage)
  }

  // Cleanup
  return () => {
    window.removeEventListener('accountDataUpdated', handleAccountUpdate)
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('manualRefresh', handleManualRefresh)
    
    // Remove Chrome extension message listener if available
    if (chrome && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(handleExtensionMessage)
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
    <ThemeProvider>
      <div className="min-w-[320px] max-w-sm bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
        {view === "config" ? (
          <ConfigurationView
            config={challengeConfig}
            onSave={handleSave}
            onConfigChange={setChallengeConfig}
            accountData={accountData}
          />
        ) : (
          <AnalyticsView 
            config={challengeConfig} 
            onBack={handleBack}
            accountData={accountData}
          />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App