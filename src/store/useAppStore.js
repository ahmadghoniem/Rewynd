import { create } from "zustand"

const useAppStore = create((set, get) => ({
  config: {
    phases: 2,
    profitTargets: { phase1: 4, phase2: 8 },
    dailyDrawdown: 2,
    maxDrawdown: 5,
    maxDrawdownType: "static",
    requireProfitableDays: 0,
    minTradingDays: 0
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

  accountData: null,
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
                console.log("Loaded account data from storage:", response.data)
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
                console.log("Account data saved to storage:", accountData)
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

  extractedTrades: [],
  setExtractedTrades: (trades) => set({ extractedTrades: trades })
}))

export default useAppStore
