import { create } from "zustand"

const useAppStore = create((set, get) => {
  // Auto-initialize when store is created
  if (typeof window !== "undefined") {
    setTimeout(() => {
      get().initialize()
    }, 0)
  }

  return {
    config: {
      phases: 2,
      profitTargets: { phase1: 4, phase2: 8 },
      dailyDrawdown: 2,
      maxDrawdown: 5,
      maxDrawdownType: "static",
      requireProfitableDays: 3,
      minTradingDays: 5,
      // Default profit targets for different phase counts
      defaults: {
        profitTargets: {
          1: { phase1: 10 },
          2: { phase1: 4, phase2: 8 },
          3: { phase1: 2, phase2: 2, phase3: 2 }
        }
      }
    },
    setConfig: (config) => set({ config }),

    // Challenge config management functions
    loadChallengeConfig: () => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "GET_CHALLENGE_CONFIG" },
              (response) => {
                if (response && response.data) {
                  // console.log(
                  //   "Loaded challenge config from storage:",
                  //   response.data
                  // )
                  set({ config: response.data })
                  resolve(response.data)
                } else {
                  // console.log(
                  //   "No challenge config found in storage, using defaults"
                  // )
                  resolve(null)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(null)
          }
        } catch (error) {
          console.error("Error loading challenge config:", error)
          resolve(null)
        }
      })
    },

    saveChallengeConfig: (config) => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "SET_CHALLENGE_CONFIG", data: config },
              (response) => {
                if (response && response.success) {
                  // console.log("Challenge config saved to storage:", config)
                  set({ config })
                  resolve(true)
                } else {
                  console.error("Failed to save challenge config")
                  resolve(false)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(false)
          }
        } catch (error) {
          console.error("Error saving challenge config:", error)
          resolve(false)
        }
      })
    },

    updateChallengeConfig: (newConfig) => {
      const currentConfig = get().config
      const updatedConfig = { ...currentConfig, ...newConfig }
      return get().saveChallengeConfig(updatedConfig)
    },
    // account Data management functions
    accountData: {
      balance: null,
      realizedPnL: null,
      capital: null,
      lastUpdated: null
    },
    setAccountData: (accountData) => set({ accountData }),

    // Account data management functions
    loadAccountData: () => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "GET_ACCOUNT_DATA" },
              (response) => {
                if (response && response.data) {
                  set({ accountData: response.data })
                  resolve(response.data)
                } else {
                  console.log("No account data found in storage")
                  resolve(null)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(null)
          }
        } catch (error) {
          console.error("Error loading account data:", error)
          resolve(null)
        }
      })
    },

    saveAccountData: (accountData) => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "ACCOUNT_DATA_UPDATE", data: accountData },
              (response) => {
                if (response && response.success) {
                  set({ accountData })
                  resolve(true)
                } else {
                  console.error("Failed to save account data")
                  resolve(false)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(false)
          }
        } catch (error) {
          console.error("Error saving account data:", error)
          resolve(false)
        }
      })
    },

    updateAccountData: (newAccountData) => {
      const currentData = get().accountData
      const updatedData = {
        ...currentData,
        ...newAccountData,
        lastUpdated: Date.now()
      }
      return get().saveAccountData(updatedData)
    },

    extractedTrades: [],
    setExtractedTrades: (trades) => set({ extractedTrades: trades }),

    // Trade data management functions
    loadTradeData: () => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "GET_TRADE_DATA" },
              (response) => {
                if (response && response.data) {
                  set({ extractedTrades: response.data.trades || [] })
                  resolve(response.data)
                } else {
                  console.log("No trade data found in storage")
                  resolve(null)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(null)
          }
        } catch (error) {
          console.error("Error loading trade data:", error)
          resolve(null)
        }
      })
    },

    saveTradeData: (tradeData) => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "TRADE_DATA_UPDATE", data: tradeData },
              (response) => {
                if (response && response.success) {
                  set({ extractedTrades: tradeData.trades || [] })
                  resolve(true)
                } else {
                  console.error("Failed to save trade data")
                  resolve(false)
                }
              }
            )
          } else {
            console.log("Chrome extension not available")
            resolve(false)
          }
        } catch (error) {
          console.error("Error saving trade data:", error)
          resolve(false)
        }
      })
    },

    updateTradeData: (newTradeData) => {
      const currentData = get().extractedTrades
      const updatedData = {
        trades: [...currentData, ...newTradeData],
        lastUpdated: Date.now()
      }
      return get().saveTradeData(updatedData)
    },

    // Preset management functions
    savePreset: (presetData) => {
      return new Promise((resolve) => {
        try {
          // Save to Chrome extension storage if available
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "SAVE_PRESET", data: presetData },
              (response) => {
                if (response && response.success) {
                  console.log(
                    "Preset saved to extension storage:",
                    presetData.name
                  )
                  resolve(true)
                } else {
                  // Fallback to localStorage
                  const existingPresets = JSON.parse(
                    localStorage.getItem("fxReplayPresets") || "[]"
                  )
                  const updatedPresets = [...existingPresets, presetData]
                  localStorage.setItem(
                    "fxReplayPresets",
                    JSON.stringify(updatedPresets)
                  )
                  console.log("Preset saved to localStorage:", presetData.name)
                  resolve(true)
                }
              }
            )
          } else {
            // Fallback to localStorage
            const existingPresets = JSON.parse(
              localStorage.getItem("fxReplayPresets") || "[]"
            )
            const updatedPresets = [...existingPresets, presetData]
            localStorage.setItem(
              "fxReplayPresets",
              JSON.stringify(updatedPresets)
            )
            console.log("Preset saved to localStorage:", presetData.name)
            resolve(true)
          }
        } catch (error) {
          console.error("Error saving preset:", error)
          resolve(false)
        }
      })
    },

    loadPresets: () => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "GET_PRESETS" }, (response) => {
              if (response && response.data) {
                resolve(response.data)
              } else {
                // Fallback to localStorage
                const presets = JSON.parse(
                  localStorage.getItem("fxReplayPresets") || "[]"
                )
                resolve(presets)
              }
            })
          } else {
            // Fallback to localStorage
            const presets = JSON.parse(
              localStorage.getItem("fxReplayPresets") || "[]"
            )
            resolve(presets)
          }
        } catch (error) {
          console.error("Error loading presets:", error)
          resolve([])
        }
      })
    },

    deletePreset: (presetName) => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "DELETE_PRESET", data: { name: presetName } },
              (response) => {
                if (response && response.success) {
                  console.log(
                    "Preset deleted from extension storage:",
                    presetName
                  )
                  resolve(true)
                } else {
                  // Fallback to localStorage
                  const existingPresets = JSON.parse(
                    localStorage.getItem("fxReplayPresets") || "[]"
                  )
                  const updatedPresets = existingPresets.filter(
                    (p) => p.name !== presetName
                  )
                  localStorage.setItem(
                    "fxReplayPresets",
                    JSON.stringify(updatedPresets)
                  )
                  console.log("Preset deleted from localStorage:", presetName)
                  resolve(true)
                }
              }
            )
          } else {
            // Fallback to localStorage
            const existingPresets = JSON.parse(
              localStorage.getItem("fxReplayPresets") || "[]"
            )
            const updatedPresets = existingPresets.filter(
              (p) => p.name !== presetName
            )
            localStorage.setItem(
              "fxReplayPresets",
              JSON.stringify(updatedPresets)
            )
            console.log("Preset deleted from localStorage:", presetName)
            resolve(true)
          }
        } catch (error) {
          console.error("Error deleting preset:", error)
          resolve(false)
        }
      })
    },

    // Initialize all data
    initialize: () => {
      console.log("Initializing store data...")
      get().loadChallengeConfig()
      get().loadAccountData()
      get().loadTradeData()
    }
  }
})

export default useAppStore
