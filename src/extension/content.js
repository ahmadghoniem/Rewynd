// content.js - Enhanced content script with account tracking
// Requires: utils.js
/* eslint-disable no-undef */

;(function () {
  // Account tracking functionality
  function extractAccountData() {
    // Find account section with multiple fallback selectors
    let accountSection = document.querySelector(
      "div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow"
    )

    if (!accountSection) {
      return null
    }

    // Extract data from spans
    const spans = accountSection.querySelectorAll("span.select-none.text-sm")
    let accountBalance = null
    let realizedPnL = null

    spans.forEach((span) => {
      const text = span.textContent.trim()

      if (text.includes("Account Balance:")) {
        const match = text.match(/Account Balance:\s*\$?([\d,.-]+)/)
        if (match) {
          accountBalance = parseFloat(match[1].replace(/,/g, ""))
        }
      } else if (text.includes("Realized PnL:")) {
        // Handle negative format: "Realized PnL: -$1,240.81"
        const match = text.match(/Realized PnL:\s*-\$?([\d,.-]+)/)
        if (match) {
          realizedPnL = -parseFloat(match[1].replace(/,/g, ""))
        } else {
          // Handle positive format: "Realized PnL: $1,240.81"
          const positiveMatch = text.match(/Realized PnL:\s*\$?([\d,.-]+)/)
          if (positiveMatch) {
            realizedPnL = parseFloat(positiveMatch[1].replace(/,/g, ""))
          }
        }
      }
    })

    // Calculate account size
    const initialCapital =
      accountBalance && realizedPnL !== null
        ? accountBalance - realizedPnL
        : accountBalance

    const result = {
      balance: accountBalance,
      realizedPnL: realizedPnL || 0,
      capital: initialCapital,
      lastUpdated: Date.now()
    }

    return result
  }

  function saveAccountData(data) {
    try {
      // Use the store's saveAccountData function
      if (window.useAppStore) {
        window.useAppStore.getState().saveAccountData(data)
      } else {
        // Fallback to direct messaging if store is not available
        chrome.runtime.sendMessage(
          {
            type: "ACCOUNT_DATA_UPDATE",
            data: data
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending account data:",
                chrome.runtime.lastError
              )
              return
            }
            if (response && response.success) {
              // console.log("Account data sent to background script")
            }
          }
        )
      }
    } catch (error) {
      console.error("Error saving account data:", error)
    }
  }

  // Track extraction state to prevent race conditions
  let isExtracting = false
  let extractionTimeout = null

  function trackAccountData() {
    const data = extractAccountData()
    if (data) {
      // Save account data normally
      saveAccountData(data)

      // Debounce trade extraction to prevent race conditions
      if (extractionTimeout) {
        clearTimeout(extractionTimeout)
      }

      extractionTimeout = setTimeout(() => {
        // Only extract if not already extracting
        if (!isExtracting) {
          isExtracting = true
          extractTradeHistory(false)
            .then((trades) => {
              if (trades) {
                saveTradeData(trades) // Append new trades when account changes (default behavior)
              }
            })
            .catch((error) => {
              console.error(
                "Error extracting trades after account change:",
                error
              )
            })
            .finally(() => {
              isExtracting = false
            })
        }
      }, 600) // Reduced from 1000ms to 600ms debounce
    }
  }

  // Trade data extraction functionality
  function extractTradeHistory(forceRefresh = false) {
    return new Promise((resolve) => {
      // First, ensure we're on the "Closed positions" tab
      function switchToClosedPositionsTab() {
        const tabList = document.querySelector(".p-tablist-tab-list")
        if (!tabList) {
          // console.log("Tab list not found")
          return false
        }

        // Find the "Closed positions" tab
        const tabs = tabList.querySelectorAll("p-tab")
        let closedPositionsTab = null

        for (const tab of tabs) {
          if (tab.textContent && tab.textContent.includes("Closed positions")) {
            closedPositionsTab = tab
            break
          }
        }

        if (!closedPositionsTab) {
          // console.log("Closed positions tab not found")
          return false
        }

        // Check if it's already active
        if (closedPositionsTab.getAttribute("data-p-active") === "true") {
          return true
        }

        // Click the tab to switch to it
        closedPositionsTab.click()
        return true
      }

      // Switch to closed positions tab first
      const tabSwitched = switchToClosedPositionsTab()
      if (!tabSwitched) {
        // console.log("Failed to switch to Closed positions tab")
        resolve(null)
        return
      }

      // Find the closed position table
      const closedPositionTable = document.querySelector(
        "lib-closed-position-table"
      )

      if (!closedPositionTable) {
        // console.log("Closed position table not found after tab switch")
        resolve(null)
        return
      }

      // Find the table inside
      const table = closedPositionTable.querySelector("table[fxr-ui-table]")

      if (!table) {
        // console.log("Table not found inside closed position table")
        resolve(null)
        return
      }

      // Function to set rows per page to maximum (20) for faster extraction
      function setRowsPerPageToMax() {
        // Find the pagination bar within the closed position table
        const paginationBar = closedPositionTable.querySelector(
          "fxr-ui-pagination-bar"
        )
        if (!paginationBar) return false

        // Find the rows per page dropdown button
        const button = paginationBar.querySelector("button[cdkoverlayorigin]")
        if (!button) return false

        // Check if already set to maximum (20)
        const currentValue = button.querySelector("span")?.textContent?.trim()
        if (currentValue === "20") return true

        // Open dropdown and find "20" option
        button.click()

        // Wait for overlay to appear and find "20" option
        const overlay = document.getElementById("cdk-overlay-0")

        if (overlay) {
          // Find and click "20" option
          const buttons = overlay.querySelectorAll("button")
          const option = Array.from(buttons).find(
            (btn) => btn.textContent?.trim() === "20"
          )
          if (option) {
            option.click()
          }
        }

        return true
      }

      // Set rows per page to maximum before extraction
      setRowsPerPageToMax()

      // Function to extract trades from current page
      function extractTradesFromCurrentPage() {
        const rows = table.querySelectorAll("tbody tr")
        const trades = []

        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll("td")

          const trade = {
            rowIndex: rowIndex, // Add row index for navigation
            asset: cells[1]?.textContent?.trim() || "",
            side: cells[2]?.textContent?.trim() || "",
            dateStart: cells[3]?.textContent?.trim() || "",
            dateEnd: cells[4]?.textContent?.trim() || "",
            entry: cells[5]?.textContent?.trim() || "",
            initialSL: cells[6]?.textContent?.trim() || "",
            maxTP: cells[7]?.textContent?.trim() || "",
            maxRR: cells[8]?.textContent?.trim() || "",
            size: cells[9]?.textContent?.trim() || "",
            closeAvg: cells[10]?.textContent?.trim() || "",
            realized: cells[11]?.textContent?.trim() || "",
            commission: cells[12]?.textContent?.trim() || "$0.00"
          }
          trades.push(trade)
        })

        return trades
      }

      // Function to get pagination info
      function getPaginationInfo() {
        const paginationText = closedPositionTable.textContent
        const pageMatch = paginationText.match(/of (\d+)/)
        const totalPages = pageMatch ? parseInt(pageMatch[1]) : 1
        return totalPages
      }

      // Function to go to next page
      function goToNextPage() {
        const nextButton = closedPositionTable.querySelector(
          'button[data-test="next"]'
        )
        if (nextButton && !nextButton.disabled) {
          nextButton.click()
          return true
        }
        return false
      }

      // Function to go to page 1
      async function goToPage1() {
        // Cache the current page once at the start
        let currentPage = getCurrentPage()

        if (currentPage === 1) {
          return
        }

        // console.log(`Navigating from page ${currentPage} to page 1...`)

        // Cache the previous button to avoid repeated DOM queries
        const prevButton = closedPositionTable.querySelector(
          'button[data-test="prev"]'
        )

        if (!prevButton) {
          console.warn("Previous button not found")
          return
        }

        // Navigate to page 1 by going to previous page the exact number of times needed
        const pagesToGoBack = currentPage - 1
        for (let i = 0; i < pagesToGoBack; i++) {
          if (prevButton.disabled) {
            console.warn("Previous button disabled")
            break
          }

          prevButton.click()
          await new Promise((resolve) => setTimeout(resolve, 25))

          // Update current page without calling getCurrentPage() in every iteration
          currentPage = Math.max(1, currentPage - 1)

          // If we've reached page 1, we're done
          if (currentPage === 1) {
            // console.log("Successfully reached page 1")
            break
          }
        }

        // Final verification only if we didn't reach page 1
        if (currentPage !== 1) {
          const finalPage = getCurrentPage()
          if (finalPage !== 1) {
            console.warn(`Failed to reach page 1. Current page: ${finalPage}`)
          }
        }
      }

      // Function to get current page number
      function getCurrentPage() {
        // Look for the current page number in the pagination dropdown
        const pageDropdowns = closedPositionTable.querySelectorAll(
          "button[fxr-ui-button] span"
        )

        // Debug: log what we found
        console.log("🔍 Found page dropdowns:", pageDropdowns.length)
        pageDropdowns.forEach((dropdown, index) => {
          console.log(`  Dropdown ${index}: "${dropdown.textContent.trim()}"`)
        })

        // The current page is in the second dropdown (page selector)
        if (pageDropdowns && pageDropdowns.length >= 2) {
          const pageText = pageDropdowns[1].textContent.trim()
          const pageNumber = parseInt(pageText)
          console.log(`📄 Current page from dropdown: ${pageNumber}`)
          return isNaN(pageNumber) ? 1 : pageNumber
        }

        return 1
      }

      // Optimized function to wait for table update using MutationObserver with retry logic
      async function waitForTableUpdate(
        tableBody,
        oldContent,
        maxWaitMs = 500, // Reduced from 800ms to 500ms since observer is more efficient
        retryCount = 0,
        maxRetries = 3
      ) {
        if (!tableBody) {
          return false
        }

        // Quick initial check - sometimes the table updates immediately
        await new Promise((resolve) => setTimeout(resolve, 10))
        let newContent = Array.from(tableBody.querySelectorAll("tr"))
          .map((row) => row.innerText)
          .join("|")
        if (newContent !== oldContent) {
          return true // Table updated immediately
        }

        // Use MutationObserver for more efficient detection
        return new Promise((resolve) => {
          const observer = new MutationObserver(() => {
            // Add delay to ensure DOM is fully updated before checking content
            setTimeout(() => {
              const currentContent = Array.from(
                tableBody.querySelectorAll("tr")
              )
                .map((row) => row.innerText)
                .join("|")

              if (currentContent !== oldContent) {
                observer.disconnect()
                resolve(true) // Table updated
              }
            }, 50) // 50ms delay to ensure table is fully rendered
          })

          // Observe changes to the table body
          observer.observe(tableBody, {
            childList: true,
            subtree: true,
            characterData: true
          })

          // Set timeout as fallback
          setTimeout(async () => {
            observer.disconnect()

            // Retry logic if timeout occurs
            if (retryCount < maxRetries) {
              console.log(
                `🔄 Table update timeout on retry ${
                  retryCount + 1
                }/${maxRetries}, retrying...`
              )
              // Wait a bit longer before retry
              await new Promise((resolve) => setTimeout(resolve, 200))
              const retryResult = await waitForTableUpdate(
                tableBody,
                oldContent,
                maxWaitMs,
                retryCount + 1,
                maxRetries
              )
              resolve(retryResult)
            } else {
              console.warn(`❌ Table update failed after ${maxRetries} retries`)
              resolve(false) // Final timeout after all retries
            }
          }, maxWaitMs)
        })
      }

      // Main extraction process with optimizations
      async function extractAllTrades() {
        const allTrades = []
        const totalPages = getPaginationInfo()

        // Cache table body reference to avoid repeated queries
        const tableBody = closedPositionTable.querySelector(
          "table[fxr-ui-table] tbody"
        )

        // Always start from page 1
        const currentPage = getCurrentPage()
        if (currentPage !== 1) {
          await goToPage1()
        }

        if (forceRefresh) {
          // Force refresh mode: scan all pages

          for (let page = 1; page <= totalPages; page++) {
            // Reduced wait time for first page from 500ms to 200ms
            if (page > 1) {
              // Click next and wait for table to update
              const oldContent = tableBody
                ? Array.from(tableBody.querySelectorAll("tr"))
                    .map((row) => row.innerText)
                    .join("|")
                : ""

              const hasNext = goToNextPage()
              if (!hasNext) {
                // console.log(`No more pages after page ${page - 1}`)
                break
              }

              // Add delay after navigation to ensure page loads completely
              await new Promise((resolve) => setTimeout(resolve, 50))

              // Wait for table body to change with optimized timeout and retry logic
              const updated = await waitForTableUpdate(tableBody, oldContent)
              if (!updated) {
                console.warn(
                  `⚠️ Table update failed on page ${page} after all retries`
                )
              } else {
                console.log(`✅ Table updated successfully on page ${page}`)
              }
            } else {
              // Reduced first page wait from 500ms to 200ms
              await new Promise((resolve) => setTimeout(resolve, 50)) // Reduced from 100ms to 50ms
            }

            // Extract trades from current page
            const pageTrades = extractTradesFromCurrentPage()
            allTrades.push(...pageTrades)
          }

          console.log(
            `✅ Force refresh: Total trades extracted: ${allTrades.length}`
          )
        } else {
          // Extract trades from page 1 only
          const pageTrades = extractTradesFromCurrentPage()
          allTrades.push(...pageTrades)

          console.log(
            `✅ Default mode: Trades extracted from page 1: ${allTrades.length}`
          )
        }

        // Ensure we're on page 1 before returning to extension (only in force refresh mode)
        if (forceRefresh) {
          const currentPage = getCurrentPage()
          if (currentPage !== 1) {
            console.log(
              `🔄 Returning to page 1 (currently on page ${currentPage})...`
            )
            await goToPage1()

            // Verify we successfully reached page 1
            const finalPage = getCurrentPage()
            if (finalPage !== 1) {
              console.warn(
                `⚠️ Failed to return to page 1. Current page: ${finalPage}`
              )
            } else {
              console.log("✅ Successfully returned to page 1")
            }
          } else {
            console.log("✅ Already on page 1, no navigation needed")
          }
        }

        return allTrades
      }

      // Start extraction
      extractAllTrades().then((allTrades) => {
        resolve(allTrades)
      })
    })
  }

  function saveTradeData(trades, forceRefresh = false) {
    try {
      const data = {
        trades: trades,
        lastUpdated: Date.now(),
        url: window.location.href
      }

      // Use the store's functions based on force refresh mode
      if (window.useAppStore) {
        if (forceRefresh) {
          window.useAppStore.getState().saveTradeData(data)
        } else {
          window.useAppStore.getState().updateTradeData(trades)
        }
      } else {
        // Fallback to direct messaging if store is not available
        chrome.runtime.sendMessage(
          {
            type: "TRADE_DATA_UPDATE",
            data: { ...data, forceRefresh: forceRefresh }
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending trade data:",
                chrome.runtime.lastError
              )
              return
            }
            if (response && response.success) {
              // console.log("Trade data sent to background script")
            }
          }
        )
      }
      // console.log("Trade data saved:", data)
    } catch (error) {
      console.error("Error saving trade data:", error)
    }
  }

  function init() {
    // Initial account tracking
    trackAccountData()

    function waitForTradeTableAndExtract() {
      const closedPositionTable = document.querySelector(
        "lib-closed-position-table"
      )
      if (!closedPositionTable) {
        setTimeout(waitForTradeTableAndExtract, 100)
        return
      }
      const table = closedPositionTable.querySelector("table[fxr-ui-table]")
      if (!table) {
        setTimeout(waitForTradeTableAndExtract, 100)
        return
      }

      // Only extract if not already extracting to prevent redundant extractions
      if (!isExtracting) {
        isExtracting = true
        extractTradeHistory(true) // Changed to true to extract all pages on initial load
          .then((trades) => {
            if (trades) {
              saveTradeData(trades, true) // Force refresh on initial load
            }
          })
          .catch((error) => {
            console.error("Error during initial trade extraction:", error)
          })
          .finally(() => {
            isExtracting = false
          })
      }
    }
    waitForTradeTableAndExtract()

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXTRACT_TRADES") {
        // Check if already extracting to prevent race conditions
        if (isExtracting) {
          sendResponse({
            success: false,
            error: "Extraction already in progress"
          })
          return true
        }

        const forceRefresh = message.forceRefresh || false

        isExtracting = true
        extractTradeHistory(forceRefresh)
          .then((trades) => {
            if (trades) {
              saveTradeData(trades, forceRefresh)
            }
            sendResponse({ success: true, trades: trades })
          })
          .catch((error) => {
            console.error("Error extracting trades:", error)
            sendResponse({ success: false, error: error.message })
          })
          .finally(() => {
            isExtracting = false
          })
        return true // Keep message channel open for async response
      }
    })

    // Store observers for cleanup
    let accountObservers = []
    let retryCount = 0
    const MAX_RETRIES = 10

    function observeAccountElements() {
      // Clean up existing observers to prevent memory leaks
      accountObservers.forEach((observer) => observer.disconnect())
      accountObservers = []

      // Find the account section
      const accountSection = document.querySelector(
        "div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow"
      )
      if (!accountSection) {
        if (retryCount < MAX_RETRIES) {
          retryCount++
          setTimeout(observeAccountElements, 500)
        }
        return
      }

      // Reset retry count on success
      retryCount = 0

      // Find the relevant spans
      let spans = []
      try {
        spans = accountSection.querySelectorAll("span.select-none.text-sm")
      } catch (e) {
        console.error("[observeAccountElements] Error querying spans:", e)
        if (retryCount < MAX_RETRIES) {
          retryCount++
          setTimeout(observeAccountElements, 500)
        }
        return
      }
      if (!spans.length) {
        if (retryCount < MAX_RETRIES) {
          retryCount++
          setTimeout(observeAccountElements, 500)
        }
        return
      }

      // Create observers and store them for cleanup
      spans.forEach((span) => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach(() => {
            // Debounce the trackAccountData call to prevent rapid firing
            if (extractionTimeout) {
              clearTimeout(extractionTimeout)
            }
            extractionTimeout = setTimeout(() => {
              trackAccountData()
            }, 300) // Reduced from 500ms to 300ms debounce
          })
        })
        observer.observe(span, {
          characterData: true,
          childList: true,
          subtree: true
        })
        accountObservers.push(observer)
      })
    }

    observeAccountElements()

    // Cleanup function to prevent memory leaks
    function cleanup() {
      // Disconnect all observers
      accountObservers.forEach((observer) => observer.disconnect())
      accountObservers = []

      // Clear any pending timeouts
      if (extractionTimeout) {
        clearTimeout(extractionTimeout)
        extractionTimeout = null
      }

      // Reset extraction state
      isExtracting = false
    }

    // Clean up on page unload
    window.addEventListener("beforeunload", cleanup)
    window.addEventListener("unload", cleanup)
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init()
})()
