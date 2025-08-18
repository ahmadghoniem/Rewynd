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
      minTradingDays: 5
    },

    // Default profit targets for different phase counts
    profitTargetDefaults: {
      1: { phase1: 10 },
      2: { phase1: 4, phase2: 8 },
      3: { phase1: 2, phase2: 2, phase3: 2 }
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
                  console.log(
                    "Loaded challenge config from storage:",
                    response.data
                  )
                  set({ config: response.data })
                  resolve(response.data)
                } else {
                  console.log(
                    "No challenge config found in storage, using defaults"
                  )
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
                  console.log("Challenge config saved to storage:", config)
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

    // Notes management
    notes: "",
    setNotes: (notes) => set({ notes }),

    // Notes data management functions
    loadNotes: () => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: "GET_NOTES" }, (response) => {
              if (response && response.data) {
                set({ notes: response.data.notes || "" })
                resolve(response.data.notes || "")
              } else {
                console.log("No notes found in storage")
                resolve("")
              }
            })
          } else {
            // Fallback to localStorage
            const notes = localStorage.getItem("fxReplayNotes") || ""
            set({ notes })
            resolve(notes)
          }
        } catch (error) {
          console.error("Error loading notes:", error)
          resolve("")
        }
      })
    },

    saveNotes: (notes) => {
      return new Promise((resolve) => {
        try {
          if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(
              { type: "SAVE_NOTES", data: { notes } },
              (response) => {
                if (response && response.success) {
                  set({ notes })
                  console.log("Notes saved to extension storage")
                  resolve(true)
                } else {
                  // Fallback to localStorage
                  localStorage.setItem("fxReplayNotes", notes)
                  set({ notes })
                  console.log("Notes saved to localStorage")
                  resolve(true)
                }
              }
            )
          } else {
            // Fallback to localStorage
            localStorage.setItem("fxReplayNotes", notes)
            set({ notes })
            console.log("Notes saved to localStorage")
            resolve(true)
          }
        } catch (error) {
          console.error("Error saving notes:", error)
          resolve(false)
        }
      })
    },

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

    // Initialize all data
    initialize: () => {
      console.log("Initializing store data...")
      get().loadChallengeConfig()
      get().loadAccountData()
      get().loadTradeData()
      get().loadNotes()
    },

    // Export all data for backup/transfer
    exportAllData: async () => {
      try {
        const state = get()

        // Load fresh data from storage to ensure we have the latest
        const [challengeConfig, accountData, tradeData, notes] =
          await Promise.all([
            state.loadChallengeConfig(),
            state.loadAccountData(),
            state.loadTradeData(),
            state.loadNotes()
          ])

        return {
          exportMetadata: {
            exportDate: new Date().toISOString(),
            version: "1.0",
            source: "FxReplayFunded"
          },
          challengeConfig: challengeConfig || state.config,
          accountData: accountData || state.accountData,
          tradeData: state.extractedTrades || [],
          notes: notes || state.notes || ""
        }
      } catch (error) {
        console.error("Error exporting data:", error)
        throw error
      }
    },

    // Import all data and replace current data
    importAllData: async (importData) => {
      try {
        const state = get()

        // Validate import data structure
        if (
          !importData.exportMetadata ||
          !importData.challengeConfig ||
          !importData.accountData ||
          !Array.isArray(importData.tradeData)
        ) {
          throw new Error("Invalid import data structure")
        }

        // Import challenge config
        if (importData.challengeConfig) {
          await state.saveChallengeConfig(importData.challengeConfig)
        }

        // Import account data
        if (importData.accountData) {
          await state.saveAccountData(importData.accountData)
        }

        // Import trade data
        if (importData.tradeData && Array.isArray(importData.tradeData)) {
          set({ extractedTrades: importData.tradeData })
          await state.saveTradeData({
            trades: importData.tradeData,
            forceRefresh: true,
            url: window.location.href
          })
        }

        // Import notes
        if (importData.notes !== undefined) {
          await state.saveNotes(importData.notes)
        }

        console.log("Data import completed successfully")
        return true
      } catch (error) {
        console.error("Error importing data:", error)
        return false
      }
    }
  }
})

export default useAppStore
