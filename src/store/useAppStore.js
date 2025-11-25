import { create } from "zustand"
import { createConfigSlice } from "./slices/createConfigSlice"
import { createSessionSlice } from "./slices/createSessionSlice"
import { createTradeSlice } from "./slices/createTradeSlice"
import { createSyncSlice } from "./slices/createSyncSlice"
import { createObjectivesSlice } from "./slices/createObjectivesSlice"
import { createStorageListenerSlice } from "./slices/createStorageListenerSlice"

const useAppStore = create((set, get) => {
  const store = {
    ...createConfigSlice(set, get),
    ...createSessionSlice(set, get),
    ...createTradeSlice(set, get),
    ...createSyncSlice(set, get),
    ...createObjectivesSlice(set, get),
    ...createStorageListenerSlice(set, get),

    // Initialize all slices - called on store creation
    initialize: () => {
      get().loadChallengeConfig()
      get().loadSessionData()
      get().loadTradeData()
      get().loadNotes()
      get().loadSyncStatus()
    },
  }

  // Auto-initialize when store is created
  if (typeof window !== "undefined") {
    setTimeout(() => {
      store.initialize()
      store.initializeStorageListener()
    }, 0)
  }

  return store
})

export default useAppStore
