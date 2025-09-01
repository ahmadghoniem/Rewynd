import { create } from "zustand"

/* eslint-disable no-undef */

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
    // session Data management functions
    sessionData: {
      id: null,
      balance: null,
      realizedPnL: null,
      capital: null,
      lastUpdated: null
    },
    setSessionData: (sessionData) => set({ sessionData }),

    // Session data management functions
    loadSessionData: () => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "GET_SESSION_DATA" },
              (response) => {
                if (response && response.data) {
                  set({ sessionData: response.data })
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

    saveSessionData: (sessionData) => {
      return new Promise((resolve) => {
        try {
          if (
            typeof window !== "undefined" &&
            window.chrome &&
            window.chrome.runtime &&
            window.chrome.runtime.sendMessage
          ) {
            window.chrome.runtime.sendMessage(
              { type: "SESSION_DATA_UPDATE", data: sessionData },
              (response) => {
                if (response && response.success) {
                  set({ sessionData })
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

    updateSessionData: (newSessionData) => {
      const currentData = get().sessionData
      const updatedData = {
        ...currentData,
        ...newSessionData,
        lastUpdated: Date.now()
      }
      return get().saveSessionData(updatedData)
    },

    // Function to switch to a new session (clears all data and extracts fresh data)
    switchToNewSession: async (newSessionData) => {
      const state = get()

      // Clear all existing data
      set({
        sessionData: {
          id: null,
          balance: null,
          realizedPnL: null,
          capital: null,
          lastUpdated: null
        },
        extractedTrades: [],
        notes: "",
        objectives: {
          minimumTradingDays: false,
          minimumProfitableDays: false,
          profitTargets: false,
          consistencyRule: false,
          dailyDrawdown: false,
          maxDrawdown: false,
          consistencyRuleBroken: false,
          maxDailyLossBroken: false,
          maxStaticLossBroken: false
        }
      })

      // Clear trade data and notes from storage
      if (
        typeof window !== "undefined" &&
        window.chrome?.runtime?.sendMessage
      ) {
        try {
          await new Promise((resolve) => {
            window.chrome.runtime.sendMessage(
              { type: "CLEAR_TRADE_DATA" },
              resolve
            )
          })
          await new Promise((resolve) => {
            window.chrome.runtime.sendMessage({ type: "CLEAR_NOTES" }, resolve)
          })
        } catch (error) {
          console.error("Error clearing storage data:", error)
        }
      }

      // Extract fresh data from the new session
      try {
        if (chrome?.tabs) {
          const [fxReplayTab] = await chrome.tabs.query({
            url: "https://app.fxreplay.com/en-US/auth/chart/*"
          })

          if (fxReplayTab) {
            // Extract fresh session data
            const sessionResponse = await chrome.tabs.sendMessage(
              fxReplayTab.id,
              {
                type: "EXTRACT_SESSION_DATA"
              }
            )

            if (sessionResponse?.success && sessionResponse.data) {
              await state.saveSessionData(sessionResponse.data)
            }

            // Extract fresh trade data
            const tradeResponse = await chrome.tabs.sendMessage(
              fxReplayTab.id,
              {
                type: "EXTRACT_TRADES",
                forceRefresh: true
              }
            )

            if (tradeResponse?.success && tradeResponse.trades) {
              await state.saveTradeData({
                trades: tradeResponse.trades,
                forceRefresh: true,
                url: fxReplayTab.url
              })
            }
          }
        }
      } catch (error) {
        console.error("Error extracting fresh data:", error)
        // Fallback: save the provided session data
        await state.saveSessionData(newSessionData)
      }
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
      get().loadSessionData()
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
      const [challengeConfig, sessionData, , notes] = await Promise.all([
        state.loadChallengeConfig(),
        state.loadSessionData(),
        state.loadTradeData(),
        state.loadNotes()
      ])

      return {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          version: "1.0",
          source: "Rewynd"
        },
        challengeConfig: challengeConfig || state.config,
        sessionData: sessionData || state.sessionData,
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
          !importData.sessionData ||
          !Array.isArray(importData.tradeData)
        ) {
          throw new Error("Invalid import data structure")
        }

        // Import challenge config
        if (importData.challengeConfig) {
          await state.saveChallengeConfig(importData.challengeConfig)
        }

        // Import session data
        if (importData.sessionData) {
          await state.saveSessionData(importData.sessionData)
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
