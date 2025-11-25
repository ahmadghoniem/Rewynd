import { sendChromeMessage } from "@/lib/chromeHelpers"

export const createConfigSlice = (set, get) => ({
  config: {
    profitTarget: 8,
    dailyDrawdown: 2,
    maxDrawdown: 5,
    maxDrawdownType: "static",
    requireProfitableDays: 3,
    minTradingDays: 5,
    consistencyRule: 15
  },

  setConfig: (config) => set({ config }),

  loadChallengeConfig: async () => {
    const response = await sendChromeMessage({ type: "GET_CHALLENGE_CONFIG" })
    if (response?.data) {
      set({ config: response.data })
      return response.data
    }
    return null
  },

  saveChallengeConfig: async (config) => {
    const response = await sendChromeMessage({
      type: "SET_CHALLENGE_CONFIG",
      data: config
    })

    // Fallback for local dev mode (no Chrome extension)
    if (response === null) {
      set({ config })
      return true
    }

    if (response?.success) {
      set({ config })
      return true
    }
    return false
  },

  updateChallengeConfig: (newConfig) => {
    const currentConfig = get().config
    const updatedConfig = { ...currentConfig, ...newConfig }
    return get().saveChallengeConfig(updatedConfig)
  }
})
