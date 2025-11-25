import { sendChromeMessage } from "@/lib/chromeHelpers"

export const createTradeSlice = (set) => ({
  extractedTrades: [],
  setExtractedTrades: (trades) => set({ extractedTrades: trades }),

  notes: "",
  setNotes: (notes) => set({ notes }),

  loadNotes: async () => {
    const response = await sendChromeMessage({ type: "GET_NOTES" })
    if (response?.data) {
      set({ notes: response.data.notes || "" })
      return response.data.notes || ""
    }
    return ""
  },

  saveNotes: async (notes) => {
    const response = await sendChromeMessage({
      type: "SAVE_NOTES",
      data: { notes }
    })

    // Fallback for local dev mode (no Chrome extension)
    if (response === null) {
      set({ notes })
      return true
    }

    if (response?.success) {
      set({ notes })
      return true
    }
    return false
  },

  loadTradeData: async () => {
    const response = await sendChromeMessage({ type: "GET_TRADE_DATA" })
    if (response?.data) {
      set({ extractedTrades: response.data.trades || [] })
      return response.data
    }
    return null
  },

  saveTradeData: async (trades) => {
    const response = await sendChromeMessage({
      type: "TRADE_DATA_UPDATE",
      data: { trades, forceRefresh: true }
    })

    // Fallback for local dev mode (no Chrome extension)
    if (response === null) {
      set({ extractedTrades: trades })
      return true
    }

    if (response?.success) {
      set({ extractedTrades: trades })
      return true
    }
    return false
  },
})
