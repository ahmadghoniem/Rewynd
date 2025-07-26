// content.js - Enhanced content script with account tracking
// Requires: utils.js

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
              console.log("Account data sent to background script")
            }
          }
        )
      }
    } catch (error) {
      console.error("Error saving account data:", error)
    }
  }

  function trackAccountData() {
    const data = extractAccountData()
    if (data) {
      // Save account data normally
      saveAccountData(data)

      // Since account balance/PnL only changes when trades occur,
      // automatically extract the latest trades after account data changes
      extractTradeHistory(false)
        .then((trades) => {
          // Use caching for automatic extraction
          if (trades) {
            saveTradeData(trades)
          }
        })
        .catch((error) => {
          console.error("Error extracting trades after account change:", error)
        })
    }
  }

  // Trade data extraction functionality
  function extractTradeHistory(forceRefresh = false) {
    return new Promise((resolve) => {
      // Initial delay for Angular components to load
      setTimeout(() => {
        // First, ensure we're on the "Closed positions" tab
        function switchToClosedPositionsTab() {
          const tabList = document.querySelector(".p-tablist-tab-list")
          if (!tabList) {
            console.log("Tab list not found")
            return false
          }

          // Find the "Closed positions" tab
          const tabs = tabList.querySelectorAll("p-tab")
          let closedPositionsTab = null

          for (const tab of tabs) {
            if (
              tab.textContent &&
              tab.textContent.includes("Closed positions")
            ) {
              closedPositionsTab = tab
              break
            }
          }

          if (!closedPositionsTab) {
            console.log("Closed positions tab not found")
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
          console.log("Failed to switch to Closed positions tab")
          resolve(null)
          return
        }

        // Wait a bit for the tab switch to take effect
        setTimeout(() => {
          // Find the closed position table
          const closedPositionTable = document.querySelector(
            "lib-closed-position-table"
          )

          if (!closedPositionTable) {
            console.log("Closed position table not found after tab switch")
            resolve(null)
            return
          }

          // Find the table inside
          const table = closedPositionTable.querySelector("table[fxr-ui-table]")

          if (!table) {
            console.log("Table not found inside closed position table")
            resolve(null)
            return
          }

          // Smart caching: Check if we need to extract
          if (!forceRefresh) {
            // Get current table content hash for comparison
            const currentContent = table.innerText
            const contentHash = btoa(currentContent).slice(0, 32) // Simple hash

            // Check if we have cached data with the same hash
            if (
              window.lastTradeContentHash === contentHash &&
              window.lastTradeData
            ) {
              console.log("Trade data unchanged, using cached data")
              resolve(window.lastTradeData)
              return
            }
          }

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
            const currentPage = getCurrentPage()
            const totalPages = getPaginationInfo()

            if (currentPage === 1) {
              return
            }

            // Navigate to page 1 by going to previous page the exact number of times needed
            const pagesToGoBack = currentPage - 1

            for (let i = 0; i < pagesToGoBack; i++) {
              const prevButton = closedPositionTable.querySelector(
                'button[data-test="prev"]'
              )
              if (!prevButton || prevButton.disabled) {
                break
              }

              prevButton.click()
              await new Promise((resolve) => setTimeout(resolve, 150)) // Wait for page change

              // Verify we're moving in the right direction
              const newPage = getCurrentPage()

              if (newPage >= currentPage) {
                console.warn("Page navigation not working as expected")
                break
              }
            }
          }

          // Function to get current page number
          function getCurrentPage() {
            const pageDropdown = closedPositionTable.querySelector(
              "button[fxr-ui-button] span"
            )
            if (pageDropdown) {
              const pageText = pageDropdown.textContent.trim()
              const pageNumber = parseInt(pageText)
              return isNaN(pageNumber) ? 1 : pageNumber
            }
            return 1
          }

          // Optimized function to wait for table update
          async function waitForTableUpdate(
            tableBody,
            oldContent,
            maxWaitMs = 800 // Reduced from 1500ms to 800ms
          ) {
            const startTime = Date.now()

            // Quick initial check - sometimes the table updates immediately
            await new Promise((resolve) => setTimeout(resolve, 10))
            let newContent = tableBody
              ? Array.from(tableBody.querySelectorAll("tr"))
                  .map((row) => row.innerText)
                  .join("|")
              : ""
            if (newContent !== oldContent) {
              return true // Table updated immediately
            }

            // Continue polling with shorter intervals
            while (Date.now() - startTime < maxWaitMs) {
              await new Promise((resolve) => setTimeout(resolve, 25)) // Reduced from 50ms to 25ms for faster polling
              newContent = tableBody
                ? Array.from(tableBody.querySelectorAll("tr"))
                    .map((row) => row.innerText)
                    .join("|")
                : ""
              if (newContent !== oldContent) {
                return true // Table updated
              }
            }
            return false // Timeout
          }

          // Main extraction process with optimizations
          async function extractAllTrades() {
            const allTrades = []
            const totalPages = getPaginationInfo()

            // Cache table body reference to avoid repeated queries
            const tableBody = closedPositionTable.querySelector(
              "table[fxr-ui-table] tbody"
            )

            console.log(`Starting trade extraction for ${totalPages} pages...`)

            // Always start from page 1
            const currentPage = getCurrentPage()
            if (currentPage !== 1) {
              await goToPage1()
              // Wait a bit for the page change to settle
              await new Promise((resolve) => setTimeout(resolve, 200))
            }

            for (let page = 1; page <= totalPages; page++) {
              // Reduced wait time for first page from 1000ms to 200ms
              if (page > 1) {
                // Click next and wait for table to update
                const oldContent = tableBody
                  ? Array.from(tableBody.querySelectorAll("tr"))
                      .map((row) => row.innerText)
                      .join("|")
                  : ""

                const hasNext = goToNextPage()
                if (!hasNext) {
                  console.log(`No more pages after page ${page - 1}`)
                  break
                }

                // Wait for table body to change with optimized timeout
                const updated = await waitForTableUpdate(tableBody, oldContent)
                if (!updated) {
                  console.warn(`Table update timeout on page ${page}`)
                }
              } else {
                // Reduced first page wait from 1000ms to 200ms
                await new Promise((resolve) => setTimeout(resolve, 100)) // Reduced from 200ms to 100ms
              }

              // Extract trades from current page
              const pageTrades = extractTradesFromCurrentPage()
              pageTrades.forEach((trade) => {
                trade.page = page
              })
              allTrades.push(...pageTrades)
            }

            console.log(`Total trades extracted: ${allTrades.length}`)

            // Return to page 1 after extraction
            await goToPage1()

            return allTrades
          }

          // Start extraction
          extractAllTrades().then((allTrades) => {
            // Cache the results for future use
            if (allTrades && allTrades.length > 0) {
              const currentContent = table.innerText
              window.lastTradeContentHash = btoa(currentContent).slice(0, 32)
              window.lastTradeData = allTrades
              console.log("Trade data cached for future use")
            }
            resolve(allTrades)
          })
        }, 200) // Wait 200ms for tab switch to complete
      }, 200) // Initial delay for Angular components to load
    })
  }

  function saveTradeData(trades) {
    try {
      const data = {
        trades: trades,
        lastUpdated: Date.now(),
        url: window.location.href
      }

      // Use the store's saveTradeData function
      if (window.useAppStore) {
        window.useAppStore.getState().saveTradeData(data)
      } else {
        // Fallback to direct messaging if store is not available
        chrome.runtime.sendMessage(
          {
            type: "TRADE_DATA_UPDATE",
            data: data
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
              console.log("Trade data sent to background script")
            }
          }
        )
      }
      console.log("Trade data saved:", data)
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
        setTimeout(waitForTradeTableAndExtract, 500) // Increased from 50ms to 500ms
        return
      }
      const table = closedPositionTable.querySelector("table[fxr-ui-table]")
      if (!table) {
        setTimeout(waitForTradeTableAndExtract, 500) // Increased from 50ms to 500ms
        return
      }
      // Table is present, extract trades once
      extractTradeHistory(false)
        .then((trades) => {
          // Use caching for initial extraction
          if (trades) {
            saveTradeData(trades)
          }
        })
        .catch((error) => {
          console.error("Error during initial trade extraction:", error)
        })
    }
    waitForTradeTableAndExtract()

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXTRACT_TRADES") {
        extractTradeHistory(true)
          .then((trades) => {
            // Force refresh for manual extraction
            if (trades) {
              saveTradeData(trades)
            }
            sendResponse({ success: true, trades: trades })
          })
          .catch((error) => {
            console.error("Error extracting trades:", error)
            sendResponse({ success: false, error: error.message })
          })
        return true // Keep message channel open for async response
      }

      if (message.type === "EXTRACT_ALL_DATA") {
        console.log("Extracting all data (account + trades)...")

        // Extract account data first
        const accountData = extractAccountData()
        if (accountData) {
          saveAccountData(accountData)

          // Then extract trades with force refresh for manual refresh
          extractTradeHistory(true)
            .then((trades) => {
              if (trades) {
                saveTradeData(trades)
              }
              console.log("All data extracted successfully")
              sendResponse({ success: true })
            })
            .catch((error) => {
              console.error("Error extracting trades:", error)
              sendResponse({ success: false, error: error.message })
            })
        } else {
          console.log("No account data found to extract")
          sendResponse({ success: false, error: "No account data found" })
        }
        return true // Keep message channel open for async response
      }
    })

    function observeAccountElements() {
      // Find the account section
      const accountSection = document.querySelector(
        "div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow"
      )
      if (!accountSection) {
        console.log(
          "[observeAccountElements] Account section not found for observer setup, retrying in 1s..."
        )
        setTimeout(observeAccountElements, 1000)
        return
      }

      // Find the relevant spans
      let spans = []
      try {
        spans = accountSection.querySelectorAll("span.select-none.text-sm")
      } catch (e) {
        console.error("[observeAccountElements] Error querying spans:", e)
        setTimeout(observeAccountElements, 1000)
        return
      }
      if (!spans.length) {
        console.log(
          "[observeAccountElements] Account balance/realized PnL spans not found, retrying in 1s..."
        )
        setTimeout(observeAccountElements, 1000)
        return
      }

      spans.forEach((span) => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            console.log("Observed mutation in account element:", mutation)
            trackAccountData()
          })
        })
        observer.observe(span, {
          characterData: true,
          childList: true,
          subtree: true
        })
        console.log("👁️ Now observing:", span.textContent)
      })
    }

    observeAccountElements()
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init()
})()
