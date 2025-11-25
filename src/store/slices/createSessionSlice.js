import { sendChromeMessage } from "@/lib/chromeHelpers"

// Helper to get initial objectives state
const getInitialObjectives = () => ({
  minimumTradingDays: false,
  minimumProfitableDays: false,
  profitTarget: false,
  consistencyRule: false,
  dailyDrawdown: false,
  maxDrawdown: false,
  consistencyRuleBroken: false,
  maxDailyLossBroken: false,
  maxStaticLossBroken: false
})

export const createSessionSlice = (set) => ({
  sessionData: {
    id: null,
    balance: null,
    realizedPnL: null,
    capital: null,
    lastUpdated: null
  },
  setSessionData: (sessionData) => set({ sessionData }),

  loadSessionData: async () => {
    const response = await sendChromeMessage({ type: "GET_SESSION_DATA" })
    if (response?.data) {
      set({ sessionData: response.data })
      return response.data
    }
    return null
  },

  saveSessionData: async (sessionData) => {
    const response = await sendChromeMessage({
      type: "SESSION_DATA_UPDATE",
      data: sessionData
    })

    // Fallback for local dev mode (no Chrome extension)
    if (response === null) {
      set({ sessionData })
      return true
    }

    if (response?.success) {
      set({ sessionData })
      return true
    }
    return false
  },

  switchToNewSession: async (newSessionId) => {
    // Clear all existing data but preserve the new session ID
    set({
      sessionData: {
        id: newSessionId || null,
        balance: null,
        realizedPnL: null,
        capital: null,
        lastUpdated: null
      },
      extractedTrades: [],
      notes: "",
      objectives: getInitialObjectives(),
      isInSync: false,
    })

    // Clear trade data, notes, and session data from storage
    if (
      typeof window !== "undefined" &&
      window.chrome?.runtime?.sendMessage
    ) {
      try {
        // Stop observer when switching sessions
        await new Promise((resolve) => {
          window.chrome.runtime.sendMessage(
            { type: "STOP_OBSERVER" },
            resolve
          )
        })

        await new Promise((resolve) => {
          window.chrome.runtime.sendMessage(
            { type: "RESET_SESSION" },
            resolve
          )
        })
      } catch (error) {
        console.error("Error resetting session data:", error)
      }
    }
  },
})
