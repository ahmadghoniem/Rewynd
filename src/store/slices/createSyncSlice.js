import { sendChromeMessage } from "@/lib/chromeHelpers"

export const createSyncSlice = (set, get) => ({
  isInSync: false,
  setIsInSync: (isInSync) => set({ isInSync }),

  loadSyncStatus: async () => {
    const response = await sendChromeMessage({ type: "GET_SYNC_STATUS" })
    if (response?.data !== undefined) {
      set({ isInSync: response.data })
      return response.data
    }
    return false
  },

  handleSync: async () => {
    const state = get()

    if (!window.chrome?.tabs) {
      alert("Chrome extension messaging not available.")
      return { success: false, error: "Chrome tabs API not available" }
    }

    set({ isInSync: false })

    try {
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const [fxReplayTab] = await chrome.tabs.query({
        url: "https://app.fxreplay.com/*/auth/testing/chart/*"
      })

      if (!fxReplayTab) {
        alert("Please open an active FxReplay session.")
        return { success: false, error: "No FxReplay tab found" }
      }

      await chrome.tabs.update(fxReplayTab.id, { active: true })

      const [sessionResponse, tradeResponse] = await Promise.all([
        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_SESSION_DATA"
        }),

        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_TRADES",
          forceRefresh: true
        })
      ])

      if (sessionResponse?.success && tradeResponse?.success) {
        await Promise.all([state.loadSessionData(), state.loadTradeData()])

        try {
          await chrome.tabs.sendMessage(fxReplayTab.id, {
            type: "MANUAL_SYNC"
          })
        } catch (syncError) {
          console.warn("Manual sync failed:", syncError.message)
        }

        set({ isInSync: true })

        try {
          await chrome.runtime.sendMessage({
            type: "SYNC_STATUS_UPDATE",
            data: true
          })
        } catch (error) {
          console.warn("Failed to update sync status:", error)
        }

        if (currentTab?.id !== fxReplayTab.id) {
          await chrome.tabs.update(currentTab.id, { active: true })
        }

        return { success: true }
      } else {
        alert("Failed to Sync data. Try reloading your active FxReplay session and then reload the App.")
        return { success: false, error: "Failed to extract data" }
      }
    } catch (error) {
      console.error("Error during sync:", error)
      alert("Error during sync. Please try again.", error)
      return { success: false, error: error.message }
    }
  },

  exportAllData: async () => {
    const state = get()

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

      // Use save methods instead of setters to persist to Chrome storage
      const results = await Promise.all([
        // Save config (already has save method)
        importData.challengeConfig
          ? state.saveChallengeConfig(importData.challengeConfig)
          : Promise.resolve(true),

        // Save session data (newly added save method)
        importData.sessionData
          ? state.saveSessionData(importData.sessionData)
          : Promise.resolve(true),

        // Save trade data (newly added save method)
        importData.tradeData && Array.isArray(importData.tradeData)
          ? state.saveTradeData(importData.tradeData)
          : Promise.resolve(true),

        // Save notes (already has save method)
        importData.notes !== undefined
          ? state.saveNotes(importData.notes)
          : Promise.resolve(true)
      ])

      // Check if all saves succeeded
      const allSucceeded = results.every((result) => result === true)

      if (!allSucceeded) {
        console.error("Some data failed to import:", results)
        return false
      }

      return true
    } catch (error) {
      console.error("Import error:", error)
      return false
    }
  }
})
