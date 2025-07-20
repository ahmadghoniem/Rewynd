import React, { useState, useEffect } from "react"
import ConfigurationView from "./configuration"
import AnalyticsView from "./analytics"
import { ThemeProvider } from "./ThemeContext"

const App = () => {
  const [view, setView] = useState("analytics") // "config" or "analytics"
  const [challengeConfig, setChallengeConfig] = useState({
    phases: 1,
    profitTargets: { phase1: 10 }
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
    if (message.type === 'TRADE_DATA_UPDATED') {
      console.log('Trade data updated via extension:', message.data)
      // This will be handled by the analytics component
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  📊 FxReplay Funded Analytics
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {view === "analytics" ? "Dashboard" : "Configuration"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {view === "config" ? (
            <div className="max-w-2xl mx-auto">
              <ConfigurationView
                config={challengeConfig}
                onSave={handleSave}
                onConfigChange={setChallengeConfig}
                accountData={accountData}
              />
            </div>
          ) : (
            <AnalyticsView 
              config={challengeConfig} 
              onBack={handleBack}
              accountData={accountData}
            />
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App