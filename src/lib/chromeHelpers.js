/**
 * Check if Chrome extension APIs are available
 * @returns {boolean} True if Chrome extension messaging is available
 */
export const isChromeExtensionAvailable = () => {
  return (
    typeof window !== "undefined" &&
    window.chrome?.runtime?.sendMessage !== undefined
  )
}

/**
 * Send a message to the Chrome extension background script
 * @param {Object} message - The message object to send
 * @returns {Promise<any>} Promise that resolves with the response or null
 */
export const sendChromeMessage = (message) => {
  return new Promise((resolve) => {
    if (!isChromeExtensionAvailable()) {
      resolve(null)
      return
    }

    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Chrome message error:", chrome.runtime.lastError)
          resolve(null)
          return
        }
        resolve(response)
      })
    } catch (error) {
      console.error("Error sending Chrome message:", error)
      resolve(null)
    }
  })
}
