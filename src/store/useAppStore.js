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
      phases: 1,
      profitTargets: { phase1: 8 },
      dailyDrawdown: 2,
      maxDrawdown: 5,
      maxDrawdownType: "static",
      requireProfitableDays: 3,
      minTradingDays: 5,
      consistencyRule: 15
    },

    setConfig: (config) => set({ config }),

    // Challenge config management functions
    loadChallengeConfig: () => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "GET_CHALLENGE_CONFIG" },
              (response) => {
                if (response && response.data) {
                  set({ config: response.data })
                  resolve(response.data)
                } else {
                  resolve(null)
                }
              }
            )
          } else {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      })
    },

    saveChallengeConfig: (config) => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "SET_CHALLENGE_CONFIG", data: config },
              (response) => {
                if (response && response.success) {
                  set({ config })
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            )
          } else {
            resolve(false)
          }
        } catch {
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
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "GET_ACCOUNT_DATA" },
              (response) => {
                if (response && response.data) {
                  set({ accountData: response.data })
                  resolve(response.data)
                } else {
                  resolve(null)
                }
              }
            )
          } else {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      })
    },

    saveAccountData: (accountData) => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "ACCOUNT_DATA_UPDATE", data: accountData },
              (response) => {
                if (response && response.success) {
                  set({ accountData })
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            )
          } else {
            resolve(false)
          }
        } catch {
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
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "GET_NOTES" },
              (response) => {
                if (response && response.data) {
                  set({ notes: response.data.notes || "" })
                  resolve(response.data.notes || "")
                } else {
                  resolve("")
                }
              }
            )
          } else {
            // Fallback to localStorage
            const notes = localStorage.getItem("fxReplayNotes") || ""
            set({ notes })
            resolve(notes)
          }
        } catch {
          resolve("")
        }
      })
    },

    saveNotes: (notes) => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "SAVE_NOTES", data: { notes } },
              (response) => {
                if (response && response.success) {
                  set({ notes })
                  resolve(true)
                } else {
                  // Fallback to localStorage
                  localStorage.setItem("fxReplayNotes", notes)
                  set({ notes })
                  resolve(true)
                }
              }
            )
          } else {
            // Fallback to localStorage
            localStorage.setItem("fxReplayNotes", notes)
            set({ notes })
            resolve(true)
          }
        } catch {
          resolve(false)
        }
      })
    },

    // Trade data management functions
    loadTradeData: () => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "GET_TRADE_DATA" },
              (response) => {
                if (response && response.data) {
                  set({ extractedTrades: response.data.trades || [] })
                  resolve(response.data)
                } else {
                  resolve(null)
                }
              }
            )
          } else {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      })
    },

    saveTradeData: (tradeData) => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "TRADE_DATA_UPDATE", data: tradeData },
              (response) => {
                if (response && response.success) {
                  set({ extractedTrades: tradeData.trades || [] })
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            )
          } else {
            resolve(false)
          }
        } catch {
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
      get().loadChallengeConfig()
      get().loadAccountData()
      get().loadTradeData()
      get().loadNotes()
    },

    // Objectives state for badge system
    objectives: {
      // Trading objectives (6 total) - just boolean checks
      minimumTradingDays: false,
      minimumProfitableDays: false,
      profitTargets: false,
      consistencyRule: false,
      dailyDrawdown: false,
      maxDrawdown: false,

      // Breaking rules (3 total)
      // Note: Only maxDailyLossBroken and maxStaticLossBroken cause challenge failure
      // consistencyRuleBroken only affects the consistency objective status
      consistencyRuleBroken: false,
      maxDailyLossBroken: false,
      maxStaticLossBroken: false
    },

    // Update specific objective status
    updateObjective: (objectiveKey, status) => {
      set((state) => ({
        objectives: {
          ...state.objectives,
          [objectiveKey]: status
        }
      }))
    },

    // Update breaking rule status
    updateBreakingRule: (ruleKey, broken) => {
      set((state) => {
        // Only update if the value is actually changing
        if (state.objectives[ruleKey] === broken) {
          return state
        }

        return {
          objectives: {
            ...state.objectives,
            [ruleKey]: broken
          }
        }
      })
    },

    // Calculate badge status based on objectives
    getBadgeStatus: () => {
      const state = get()
      const objectives = state.objectives

      // Check if all trading objectives are met
      const allObjectivesMet =
        objectives.minimumTradingDays &&
        objectives.minimumProfitableDays &&
        objectives.profitTargets &&
        objectives.consistencyRule &&
        objectives.dailyDrawdown &&
        objectives.maxDrawdown

      // Check if any breaking rules are violated (excluding consistency rule)
      // Only maxDailyLossBroken and maxStaticLossBroken cause failure
      const anyBreakingRulesViolated =
        objectives.maxDailyLossBroken || objectives.maxStaticLossBroken

      if (allObjectivesMet) {
        return "funded"
      } else if (anyBreakingRulesViolated) {
        return "failed"
      } else {
        return "in-progress"
      }
    },

    // Export all data for backup/transfer
    exportAllData: async () => {
      const state = get()

      // Load fresh data from storage to ensure we have the latest
      const [challengeConfig, accountData, , notes] = await Promise.all([
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

        return true
      } catch {
        return false
      }
    }
  }
})

export default useAppStore
