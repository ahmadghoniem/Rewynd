/**
 * Storage Listener Slice
 * Handles Chrome storage change events and updates the store accordingly.
 * This centralizes storage event handling instead of having it in the main store.
 */
export const createStorageListenerSlice = (set, get) => ({
  /**
   * Initialize the Chrome storage change listener
   * This should be called once when the store is created
   */
  initializeStorageListener: () => {
    if (typeof window === "undefined" || !window.chrome?.storage?.onChanged) {
      return
    }

    window.chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace !== "local") return

      // Handle session data updates
      if (changes.rewynd_sessionData?.newValue) {
        get().setSessionData(changes.rewynd_sessionData.newValue)
      }

      // Handle trade data updates
      if (changes.rewynd_tradeData?.newValue?.trades) {
        get().setExtractedTrades(changes.rewynd_tradeData.newValue.trades)
      }

      // Handle notes updates
      if (changes.rewynd_notesData?.newValue?.notes !== undefined) {
        get().setNotes(changes.rewynd_notesData.newValue.notes)
      }

      // Handle challenge config updates
      if (changes.challengeConfig?.newValue) {
        get().setConfig(changes.challengeConfig.newValue)
      }

      // Handle sync status updates
      if (changes.isInSync?.newValue !== undefined) {
        get().setIsInSync(changes.isInSync.newValue)
      }
    })
  }
})
