// content.js - Enhanced content script with account tracking
// Requires: utils.js

;(function () {

  // Account tracking functionality
  function extractAccountData() {
    // Find account section with multiple fallback selectors
    let accountSection = document.querySelector('div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow')
    
    if (!accountSection) {
      console.log("Account section not found")
      return null
    }

    // Extract data from spans
    const spans = accountSection.querySelectorAll('span.select-none.text-sm')
    let accountBalance = null
    let realizedPnL = null

    spans.forEach(span => {
      const text = span.textContent.trim()
      
      if (text.includes('Account Balance:')) {
        const match = text.match(/Account Balance:\s*\$?([\d,.-]+)/)
        if (match) {
          accountBalance = parseFloat(match[1].replace(/,/g, ''))
        }
      } else if (text.includes('Realized PnL:')) {
        // Handle negative format: "Realized PnL: -$1,240.81"
        const match = text.match(/Realized PnL:\s*-\$?([\d,.-]+)/)
        if (match) {
          realizedPnL = -parseFloat(match[1].replace(/,/g, ''))
        } else {
          // Handle positive format: "Realized PnL: $1,240.81"
          const positiveMatch = text.match(/Realized PnL:\s*\$?([\d,.-]+)/)
          if (positiveMatch) {
            realizedPnL = parseFloat(positiveMatch[1].replace(/,/g, ''))
          }
        }
      }
    })

    // Calculate account size
    const initialCapital = accountBalance && realizedPnL !== null 
      ? accountBalance - realizedPnL 
      : accountBalance

    const result = {
      balance: accountBalance,
      realizedPnL: realizedPnL || 0,
      capital: initialCapital,
      lastUpdated: Date.now()
    }
    
    console.log("Extracted account data:", result)
    return result
  }

  function saveAccountData(data) {
    try {
      // Send to background script for storage
      chrome.runtime.sendMessage({
        type: 'ACCOUNT_DATA_UPDATE',
        data: data
      }, (response) => {
        if (response && response.success) {
          console.log("Account data sent to background script")
        }
      })

    } catch (error) {
      console.error('Error saving account data:', error)
    }
  }

  // Trade data extraction functionality
  function extractTradeData() {
    console.log('Starting trade data extraction...')
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the closed position table
        const closedPositionTable = document.querySelector('lib-closed-position-table')
        console.log('lib-closed-position-table found:', !!closedPositionTable)
        
        if (!closedPositionTable) {
          console.log('❌ No lib-closed-position-table found')
          resolve(null)
          return
        }
        
        // Find the table inside
        const table = closedPositionTable.querySelector('table[fxr-ui-table]')
        console.log('table[fxr-ui-table] found:', !!table)
        
        if (!table) {
          console.log('❌ No table[fxr-ui-table] found inside lib-closed-position-table')
          resolve(null)
          return
        }
        
        // Function to extract trades from current page
        function extractTradesFromCurrentPage() {
          const rows = table.querySelectorAll('tbody tr')
          const trades = []
          
          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll('td')
            
              const trade = {
                rowIndex: rowIndex, // Add row index for navigation
                asset: cells[1]?.textContent?.trim() || '',
                side: cells[2]?.textContent?.trim() || '',
                dateStart: cells[3]?.textContent?.trim() || '',
                dateEnd: cells[4]?.textContent?.trim() || '',
                entry: cells[5]?.textContent?.trim() || '',
                initialSL: cells[6]?.textContent?.trim() || '',
                maxTP: cells[7]?.textContent?.trim() || '',
                maxRR: cells[8]?.textContent?.trim() || '',
                size: cells[9]?.textContent?.trim() || '',
                closeAvg: cells[10]?.textContent?.trim() || '',
                realized: cells[11]?.textContent?.trim() || '',
                commission: cells[12]?.textContent?.trim() || '$0.00',
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
          
          console.log('Total pages detected:', totalPages)
          return totalPages
        }
        
        // Function to go to next page
        function goToNextPage() {
          const nextButton = closedPositionTable.querySelector('button[data-test="next"]')
          if (nextButton && !nextButton.disabled) {
            nextButton.click()
            return true
          }
          return false
        }
        
        // Main extraction process
        async function extractAllTrades() {
          const allTrades = []
          const totalPages = getPaginationInfo()
          let lastFirstRowKey = null
          console.log(`Starting extraction of ${totalPages} pages...`)
          for (let page = 1; page <= totalPages; page++) {
            console.log(`Extracting page ${page}/${totalPages}...`)
            // Wait for page to load (on first page, just wait 1s)
            if (page > 1) {
              // Click next and wait for table to update
              const tableBody = closedPositionTable.querySelector('table[fxr-ui-table] tbody')
              const oldRows = tableBody ? Array.from(tableBody.querySelectorAll('tr')).map(row => row.innerText).join('|') : ''
              const hasNext = goToNextPage()
              if (!hasNext) {
                console.log(`❌ Could not navigate to next page. Stopping at page ${page}`)
                break
              }
              // Wait for table body to change
              let tries = 0
              while (tries < 20) { // up to 2s
                await new Promise(resolve => setTimeout(resolve, 100))
                const newRows = tableBody ? Array.from(tableBody.querySelectorAll('tr')).map(row => row.innerText).join('|') : ''
                if (newRows !== oldRows) break
                tries++
              }
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
            // Extract trades from current page
            const pageTrades = extractTradesFromCurrentPage()
            console.log(`Page ${page}: Found ${pageTrades.length} trades`)
            pageTrades.forEach(trade => {
              trade.page = page
            })
            allTrades.push(...pageTrades)
          }
          return allTrades
        }
        
        // Start extraction
        console.log('Starting extraction...')
        extractAllTrades().then(allTrades => {
          console.log('=== ALL TRADES EXTRACTED ===')
          console.log(`Total trades extracted: ${allTrades.length}`)
          resolve(allTrades)
        })
      }, 1000) // Wait 1 second for Angular components to load
    })
  }

  function saveTradeData(trades) {
    try {
      const data = {
        trades: trades,
        lastUpdated: Date.now(),
        url: window.location.href
      }
      // Send to background script for storage
      chrome.runtime.sendMessage({
        type: 'TRADE_DATA_UPDATE',
        data: data
      }, (response) => {
        if (response && response.success) {
          console.log("Trade data sent to background script")
        }
      })
      // Save to chrome.storage.local (main source of truth)
      if (chrome && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ fxreplay_trade_data: data }, () => {
          console.log('Trade data saved to chrome.storage.local:', data)
          // Notify all extension UIs
          chrome.runtime.sendMessage({ type: 'TRADE_DATA_UPDATED', data })
        })
      }
      console.log('Trade data saved:', data)
    } catch (error) {
      console.error('Error saving trade data:', error)
    }
  }


  function trackAccountData() {
    const data = extractAccountData()
    if (data) {
      // Save account data normally
      saveAccountData(data)
    }
  }

  // Global flag to prevent multiple button creation
  if (window.fxreplayButtonCreated) {
    console.log('Button already created, skipping')
    return
  }

  function init() {
    // Initial account tracking
    trackAccountData()

    // Removed: Create and inject the extension button

    function waitForTradeTableAndExtract() {
      const closedPositionTable = document.querySelector('lib-closed-position-table')
      if (!closedPositionTable) {
        setTimeout(waitForTradeTableAndExtract, 1000)
        return
      }
      const table = closedPositionTable.querySelector('table[fxr-ui-table]')
      if (!table) {
        setTimeout(waitForTradeTableAndExtract, 1000)
        return
      }
      // Table is present, extract trades once
      extractTradeData().then(trades => {
        if (trades) {
          saveTradeData(trades)
        }
      })
    }
    waitForTradeTableAndExtract()

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'EXTRACT_TRADES') {
        extractTradeData().then(trades => {
          if (trades) {
            saveTradeData(trades)
          }
          sendResponse({success: true, trades: trades})
        })
        return true // Keep message channel open for async response
      }
    })

    // Watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let hasAccountChanges = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check for account section changes
          if (mutation.target.classList?.contains('select-none') ||
              mutation.target.closest('.select-none') ||
              mutation.target.textContent?.includes('Account Balance') ||
              mutation.target.textContent?.includes('Realized PnL')) {
            hasAccountChanges = true
          }
        }
      })

      if (hasAccountChanges) {
        trackAccountData()
      }
    })

    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      characterData: true 
    })
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init()
})()