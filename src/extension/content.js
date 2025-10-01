// content.js - Enhanced content script with account tracking
// Requires: utils.js
/* eslint-disable no-undef */

;(function () {
  // Session tracking functionality
  function extractSessionData() {
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
        // Handle both negative and positive formats
        const match = text.match(/Realized PnL:\s*-?\$?([\d,.-]+)/)
        if (match) {
          const value = parseFloat(match[1].replace(/,/g, ""))
          realizedPnL = text.includes("-") ? -value : value
        }
      }
    })

    // Calculate account size
    const initialCapital =
      accountBalance && realizedPnL !== null
        ? accountBalance - realizedPnL
        : accountBalance

    // Extract session ID from URL
    const sessionId =
      window.location.pathname.split("/").pop() ||
      "834d7ae1-0b55-409a-bd3c-56f3904d44d8"

    const result = {
      id: sessionId,
      balance: accountBalance,
      realizedPnL: realizedPnL || 0,
      capital: initialCapital,
      lastUpdated: Date.now()
    }

    return result
  }

  function saveSessionData(data) {
    try {
      if (window.useAppStore) {
        window.useAppStore.getState().saveSessionData(data)
      } else {
        chrome.runtime.sendMessage(
          {
            type: "SESSION_DATA_UPDATE",
            data: data
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending session data:",
                chrome.runtime.lastError
              )
              return
            }
            if (response && response.success) {
              // Session data sent successfully
            }
          }
        )
      }
    } catch (error) {
      console.error("Error saving session data:", error)
    }
  }

  // Track extraction state to prevent race conditions
  let isExtracting = false
  let extractionTimeout = null

  function trackSessionData() {
    const data = extractSessionData()
    if (data) {
      saveSessionData(data)

      // Debounce trade extraction to prevent race conditions
      if (extractionTimeout) {
        clearTimeout(extractionTimeout)
      }

      extractionTimeout = setTimeout(() => {
        if (!isExtracting) {
          isExtracting = true
          extractTradeHistory(false)
            .then((trades) => {
              if (trades) {
                saveTradeData(trades)
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
      }, 500)
    }
  }

  function extractTradeHistory(forceRefresh = false) {
    return new Promise((resolve) => {
      function switchToClosedPositionsTab() {
        const tabList = document.querySelector(".p-tablist-tab-list")
        if (!tabList) return false

        const tabs = tabList.querySelectorAll("p-tab")
        const closedPositionsTab = Array.from(tabs).find(
          (tab) =>
            tab.textContent && tab.textContent.includes("Closed positions")
        )

        if (!closedPositionsTab) return false

        if (closedPositionsTab.getAttribute("data-p-active") === "true") {
          return true
        }

        closedPositionsTab.click()
        return true
      }

      const tabSwitched = switchToClosedPositionsTab()
      if (!tabSwitched) {
        resolve(null)
        return
      }

      const closedPositionTable = document.querySelector(
        "lib-closed-position-table"
      )
      if (!closedPositionTable) {
        resolve(null)
        return
      }

      const table = closedPositionTable.querySelector("table[fxr-ui-table]")
      if (!table) {
        resolve(null)
        return
      }

      function setRowsPerPageToMax() {
        const paginationBar = closedPositionTable.querySelector(
          "fxr-ui-pagination-bar"
        )
        if (!paginationBar) return false

        const button = paginationBar.querySelector("button[cdkoverlayorigin]")
        if (!button) return false

        button.click()

        const overlay = document.querySelector(
          "fxr-ui-card.max-h-80.ng-star-inserted"
        )
        if (overlay) {
          const options = Array.from(overlay.querySelectorAll("button"))
          if (options.length > 0) {
            // Select the last option
            const lastOption = options[options.length - 1]
            lastOption.click()
          }
        }

        return true
      }

      setRowsPerPageToMax()

      function extractTradesFromCurrentPage() {
        const rows = table.querySelectorAll("tbody tr")
        const trades = []

        rows.forEach((row, rowIndex) => {
          const cells = row.querySelectorAll("td")
          const trade = {
            rowIndex: rowIndex,
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

      function getPaginationInfo() {
        const paginationText = closedPositionTable.textContent
        const pageMatch = paginationText.match(/of (\d+)/)
        return pageMatch ? parseInt(pageMatch[1]) : 1
      }

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

      async function goToPage1() {
        let currentPage = getCurrentPage()
        if (currentPage === 1) return

        const prevButton = closedPositionTable.querySelector(
          'button[data-test="prev"]'
        )
        if (!prevButton) {
          console.warn("Previous button not found")
          return
        }

        const pagesToGoBack = currentPage - 1
        for (let i = 0; i < pagesToGoBack; i++) {
          if (prevButton.disabled) {
            console.warn("Previous button disabled")
            break
          }

          prevButton.click()
          await new Promise((resolve) => setTimeout(resolve, 25))
          currentPage = Math.max(1, currentPage - 1)

          if (currentPage === 1) break
        }

        if (currentPage !== 1) {
          const finalPage = getCurrentPage()
          if (finalPage !== 1) {
            console.warn(`Failed to reach page 1. Current page: ${finalPage}`)
          }
        }
      }

      function getCurrentPage() {
        const pageDropdowns = closedPositionTable.querySelectorAll(
          "button[fxr-ui-button] span"
        )
        if (pageDropdowns && pageDropdowns.length >= 2) {
          const pageText = pageDropdowns[1].textContent.trim()
          const pageNumber = parseInt(pageText)
          return isNaN(pageNumber) ? 1 : pageNumber
        }
        return 1
      }

      // Function to wait for table update using MutationObserver
      async function waitForTableUpdate(
        tableBody,
        oldContent,
        maxWaitMs = 500,
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
          return true
        }

        // Use MutationObserver for more efficient detection
        return new Promise((resolve) => {
          const observer = new MutationObserver(() => {
            setTimeout(() => {
              const currentContent = Array.from(
                tableBody.querySelectorAll("tr")
              )
                .map((row) => row.innerText)
                .join("|")

              if (currentContent !== oldContent) {
                observer.disconnect()
                resolve(true)
              }
            }, 50)
          })

          observer.observe(tableBody, {
            childList: true,
            subtree: true,
            characterData: true
          })

          setTimeout(async () => {
            observer.disconnect()

            if (retryCount < maxRetries) {
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
              console.warn(`Table update failed after ${maxRetries} retries`)
              resolve(false)
            }
          }, maxWaitMs)
        })
      }

      async function extractAllTrades() {
        const allTrades = []
        const totalPages = getPaginationInfo()
        const tableBody = closedPositionTable.querySelector(
          "table[fxr-ui-table] tbody"
        )

        const currentPage = getCurrentPage()
        if (currentPage !== 1) {
          await goToPage1()
        }

        if (forceRefresh) {
          for (let page = 1; page <= totalPages; page++) {
            if (page > 1) {
              const oldContent = tableBody
                ? Array.from(tableBody.querySelectorAll("tr"))
                    .map((row) => row.innerText)
                    .join("|")
                : ""

              const hasNext = goToNextPage()
              if (!hasNext) break

              await new Promise((resolve) => setTimeout(resolve, 50))
              const updated = await waitForTableUpdate(tableBody, oldContent)
              if (!updated) {
                console.warn(
                  `Table update failed on page ${page} after all retries`
                )
              }
            } else {
              await new Promise((resolve) => setTimeout(resolve, 50))
            }

            const pageTrades = extractTradesFromCurrentPage()
            allTrades.push(...pageTrades)
          }
        } else {
          const pageTrades = extractTradesFromCurrentPage()
          allTrades.push(...pageTrades)
        }

        if (forceRefresh) {
          const currentPage = getCurrentPage()
          if (currentPage !== 1) {
            await goToPage1()
            const finalPage = getCurrentPage()
            if (finalPage !== 1) {
              console.warn(
                `Failed to return to page 1. Current page: ${finalPage}`
              )
            }
          }
        }

        return allTrades
      }

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

      if (window.useAppStore) {
        if (forceRefresh) {
          window.useAppStore.getState().saveTradeData(data)
        } else {
          window.useAppStore.getState().updateTradeData(trades)
        }
      } else {
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
              // Trade data sent successfully
            }
          }
        )
      }
    } catch (error) {
      console.error("Error saving trade data:", error)
    }
  }

  // Store observer for cleanup
  let accountObserver = null
  function setupAccountObserver() {
    // Clean up existing observer to prevent memory leaks
    if (accountObserver) {
      accountObserver.disconnect()
      accountObserver = null
    }

    // Find the account section
    const accountSection = document.querySelector(
      "div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow"
    )
    if (!accountSection) {
      alert("Account section not found. Use the Sync button when ready.")
      return
    }

    // Find the first relevant span
    let span = null
    try {
      span = accountSection.querySelector("span.select-none.text-sm")
    } catch (e) {
      console.error("Error querying span:", e)
      return
    }
    if (!span) {
      console.warn("No span found in account section")
      return
    }

    // Create observer for the first span only
    accountObserver = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        // Debounce the trackSessionData call to prevent rapid firing
        if (extractionTimeout) {
          clearTimeout(extractionTimeout)
        }
        extractionTimeout = setTimeout(() => {
          trackSessionData()
        }, 300)
      })
    })

    accountObserver.observe(span, {
      characterData: true,
      childList: true,
      subtree: true
    })
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "EXTRACT_TRADES") {
      if (isExtracting) {
        sendResponse({
          success: false,
          error: "Extraction already in progress"
        })
        return true
      }

      const forceRefresh = message.forceRefresh || false
      isExtracting = true

      // Async wrapper function
      const handleExtractTrades = async () => {
        try {
          const trades = await extractTradeHistory(forceRefresh)
          if (trades) {
            saveTradeData(trades, forceRefresh)
          }
          sendResponse({ success: true, trades: trades })
        } catch (error) {
          console.error("Error extracting trades:", error)
          sendResponse({ success: false, error: error.message })
        } finally {
          isExtracting = false
        }
      }

      handleExtractTrades()
      return true
    }

    if (message.type === "EXTRACT_SESSION_DATA") {
      const sessionData = extractSessionData()
      if (sessionData) {
        saveSessionData(sessionData)
        sendResponse({ success: true, data: sessionData })
      } else {
        sendResponse({
          success: false,
          error: "Failed to extract session data"
        })
      }
      return false
    }

    if (message.type === "MANUAL_SYNC") {
      // Try to find and setup account observer
      setupAccountObserver()
      sendResponse({ success: true })
      return false
    }
  })

  function cleanup() {
    if (accountObserver) {
      accountObserver.disconnect()
      accountObserver = null
    }

    if (extractionTimeout) {
      clearTimeout(extractionTimeout)
      extractionTimeout = null
    }

    isExtracting = false
  }

  window.addEventListener("beforeunload", cleanup)
  window.addEventListener("unload", cleanup)
})()
