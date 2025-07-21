// content.js - Enhanced content script with account tracking
// Requires: utils.js

;(function () {
  console.clear()
  console.log("Trade Duration Calculator & Account Tracker")

  // Account tracking functionality
  function extractAccountData() {
    // Find account section with multiple fallback selectors
    let accountSection = document.querySelector('div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow')
    
    if (!accountSection) {
      // Fallback: find any div containing account balance text
      const divs = document.querySelectorAll('div')
      for (let div of divs) {
        if (div.textContent.includes('Account Balance:')) {
          accountSection = div
          break
        }
      }
    }
    
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
      
      // Backup to localStorage
      localStorage.setItem('tradeAnalytics_accountData', JSON.stringify(data))
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
            
            if (cells.length >= 14) {
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
                duration: cells[13]?.textContent?.trim() || ''
              }
              
              if (trade.asset && trade.realized && trade.realized !== '$0.00') {
                trades.push(trade)
                console.log(`✅ Added trade: ${trade.asset} - ${trade.realized}`)
              } else {
                console.log(`❌ Skipped row ${rowIndex}: missing asset or realized P&L`)
              }
            } else {
              console.log(`❌ Row ${rowIndex} has insufficient cells: ${cells.length}`)
            }
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
          
          console.log(`Starting extraction of ${totalPages} pages...`)
          
          for (let page = 1; page <= totalPages; page++) {
            console.log(`Extracting page ${page}/${totalPages}...`)
            
            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Extract trades from current page
            const pageTrades = extractTradesFromCurrentPage()
            console.log(`Page ${page}: Found ${pageTrades.length} trades`)
            
            // Add page number to each trade
            pageTrades.forEach(trade => {
              trade.page = page
            })
            
            allTrades.push(...pageTrades)
            
            // Go to next page if not on last page
            if (page < totalPages) {
              const hasNext = goToNextPage()
              if (!hasNext) {
                console.log(`❌ Could not navigate to next page. Stopping at page ${page}`)
                break
              }
            }
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
      
      // Backup to localStorage
      localStorage.setItem('fxreplay_trade_data', JSON.stringify(data))
      
      console.log('Trade data saved:', data)
    } catch (error) {
      console.error('Error saving trade data:', error)
    }
  }

  // Navigation functions for trade links
  async function navigateToTrade(tradeData) {
    try {
      const { trade, dateType, rowIndex } = tradeData
      console.log(`Attempting to navigate to trade: ${trade.asset} at ${trade[dateType]}`)
      
      // Find the closed position table
      const closedPositionTable = document.querySelector('lib-closed-position-table')
      if (!closedPositionTable) {
        console.log('❌ No closed position table found')
        return false
      }
      
      // Find the table
      const table = closedPositionTable.querySelector('table[fxr-ui-table]')
      if (!table) {
        console.log('❌ No table found')
        return false
      }
      
      // Find the specific row by matching trade data
      const rows = table.querySelectorAll('tbody tr')
      let targetRow = null
      
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td')
        if (cells.length >= 14) {
          const rowAsset = cells[1]?.textContent?.trim()
          const rowDateStart = cells[3]?.textContent?.trim()
          const rowDateEnd = cells[4]?.textContent?.trim()
          const rowRealized = cells[11]?.textContent?.trim()
          
          // Match by asset and date
          if (rowAsset === trade.asset && 
              (rowDateStart === trade.dateStart || rowDateEnd === trade.dateEnd) &&
              rowRealized === trade.realized) {
            targetRow = rows[i]
            console.log(`✅ Found matching row at index ${i}`)
            break
          }
        }
      }
      
      if (!targetRow) {
        console.log('❌ Could not find matching row for trade')
        return false
      }
      
      // Try to find and click the "Show on chart" button in the first column
      const firstCell = targetRow.querySelector('td:first-child')
      if (firstCell) {
        const showButton = firstCell.querySelector('button, input[type="checkbox"], [role="button"]')
        if (showButton) {
          console.log('✅ Found show on chart button, clicking...')
          showButton.click()
          return true
        }
      }
      
      // Alternative: try to find any clickable element in the row
      const clickableElements = targetRow.querySelectorAll('button, [role="button"], .cursor-pointer')
      if (clickableElements.length > 0) {
        console.log('✅ Found clickable element, clicking...')
        clickableElements[0].click()
        return true
      }
      
      console.log('❌ No clickable elements found in row')
      return false
      
    } catch (error) {
      console.error('Error navigating to trade:', error)
      return false
    }
  }

  async function clickShowOnChart(rowIndex) {
    try {
      console.log(`Attempting to click "Show on chart" for row ${rowIndex}`)
      
      // Find the closed position table
      const closedPositionTable = document.querySelector('lib-closed-position-table')
      if (!closedPositionTable) {
        console.log('❌ No closed position table found')
        return false
      }
      
      // Find the table
      const table = closedPositionTable.querySelector('table[fxr-ui-table]')
      if (!table) {
        console.log('❌ No table found')
        return false
      }
      
      // Get the specific row
      const rows = table.querySelectorAll('tbody tr')
      if (rowIndex >= rows.length) {
        console.log(`❌ Row index ${rowIndex} out of bounds (${rows.length} rows)`)
        return false
      }
      
      const targetRow = rows[rowIndex]
      console.log(`✅ Found row ${rowIndex}`)
      
      // Try to find and click the "Show on chart" button in the first column
      const firstCell = targetRow.querySelector('td:first-child')
      if (firstCell) {
        const showButton = firstCell.querySelector('button, input[type="checkbox"], [role="button"]')
        if (showButton) {
          console.log('✅ Found show on chart button, clicking...')
          showButton.click()
          return true
        }
      }
      
      // Alternative: try to find any clickable element in the row
      const clickableElements = targetRow.querySelectorAll('button, [role="button"], .cursor-pointer')
      if (clickableElements.length > 0) {
        console.log('✅ Found clickable element, clicking...')
        clickableElements[0].click()
        return true
      }
      
      console.log('❌ No clickable elements found in row')
      return false
      
    } catch (error) {
      console.error('Error clicking show on chart:', error)
      return false
    }
  }

  // Duration calculation functionality (existing)
  function addDurationColumn() {
    document.querySelectorAll("table").forEach((table) => {
      const headerRow = table.querySelector("thead tr")
      if (!headerRow) return

      const headers = Array.from(headerRow.querySelectorAll("th")).map((th) =>
        th.textContent.trim()
      )

      if (!headers.includes("Date Start") || !headers.includes("Date End"))
        return

      const startIdx = headers.findIndex((h) => h.includes("Date Start"))
      const endIdx = headers.findIndex((h) => h.includes("Date End"))
      let durationIdx = headers.findIndex((h) => h.includes("Duration"))

      // Add header if not exists
      if (durationIdx === -1) {
        headerRow.appendChild(createDurationHeader())
        durationIdx = headers.length // New index after adding header
      }

      // Add duration cells to rows that don't have them
      table.querySelectorAll("tbody tr").forEach((row) => {
        const cells = row.querySelectorAll("td")

        // Skip if duration cell already exists or insufficient cells
        if (
          cells.length > durationIdx ||
          cells.length <= Math.max(startIdx, endIdx)
        )
          return

        const startDate = getCellText(cells[startIdx])
        const endDate = getCellText(cells[endIdx])
        const duration = calculateDuration(startDate, endDate)

        row.appendChild(createDurationCell(duration))
      })
    })
  }

  function observeClosedPositionsTable() {
    let lastTableHtml = ''
    let observer = null

    function startObserver() {
      const closedPositionTable = document.querySelector('lib-closed-position-table')
      if (!closedPositionTable) {
        // Retry after a short delay if the table isn't present yet
        setTimeout(startObserver, 1000)
        return
      }
      
      // Observe changes in the closed positions table
      observer = new MutationObserver(() => {
        const table = closedPositionTable.querySelector('table[fxr-ui-table]')
        if (table) {
          const html = table.innerHTML
          if (html !== lastTableHtml) {
            lastTableHtml = html
            // Extract and save trades automatically
            extractTradeData().then(trades => {
              if (trades) {
                saveTradeData(trades)
              }
            })
          }
        }
      })
      observer.observe(closedPositionTable, { childList: true, subtree: true, characterData: true })
      // Initial extraction
      extractTradeData().then(trades => {
        if (trades) {
          saveTradeData(trades)
        }
      })
    }
    startObserver()
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

  // Function to create and inject the extension button
  function createExtensionButton() {
    // Check if button already exists
    if (document.getElementById('fxreplay-extension-button')) {
      console.log('Extension button already exists, skipping creation')
      return
    }

    console.log('Creating extension button...')

    const button = document.createElement('button')
    button.id = 'fxreplay-extension-button'
    button.textContent = '📊 Open Analytics'
    button.title = 'Open Trade Analytics in Full Screen'
    
    // Style the button
    Object.assign(button.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10000',
      padding: '10px 15px',
      backgroundColor: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease-in-out'
    })

    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#1d4ed8'
      button.style.transform = 'translateY(-2px)'
      button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    })

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#2563eb'
      button.style.transform = 'translateY(0)'
      button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    })

    // Add click handler
    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      
      console.log('Open Analytics button clicked')
      
      // Disable button temporarily to prevent multiple clicks
      button.disabled = true
      button.style.opacity = '0.6'
      button.textContent = '📊 Opening...'
      
      // Add timeout to prevent hanging
      const messageTimeout = setTimeout(() => {
        console.log('Message timeout, trying fallback method')
        try {
          const extensionUrl = chrome.runtime.getURL('dist/index.html')
          window.open(extensionUrl, '_blank')
        } catch (fallbackError) {
          console.error('Fallback method failed:', fallbackError)
        }
        
        // Re-enable button
        button.disabled = false
        button.style.opacity = '1'
        button.textContent = '📊 Open Analytics'
      }, 3000) // 3 second timeout

      chrome.runtime.sendMessage({
        type: 'OPEN_EXTENSION_TAB'
      }, (response) => {
        clearTimeout(messageTimeout) // Clear timeout if we get a response
        console.log('Response from background script:', response)
        
        if (response && response.success) {
          console.log('Extension opened in new tab successfully')
        } else {
          console.error('Failed to open extension tab:', response)
          
          // Fallback: try to open the extension URL directly
          try {
            const extensionUrl = chrome.runtime.getURL('dist/index.html')
            console.log('Trying fallback method with URL:', extensionUrl)
            window.open(extensionUrl, '_blank')
          } catch (fallbackError) {
            console.error('Fallback method also failed:', fallbackError)
          }
        }
        
        // Re-enable button after a short delay
        setTimeout(() => {
          button.disabled = false
          button.style.opacity = '1'
          button.textContent = '📊 Open Analytics'
        }, 1000)
      })
    })

    // Add to page
    document.body.appendChild(button)
    window.fxreplayButtonCreated = true
    console.log('Extension button created and added to page')
  }

  function init() {
    // Initialize duration column functionality
    addDurationColumn()
    
    // Initial account tracking
    trackAccountData()

    // Create and inject the extension button
    createExtensionButton()

    // Observe closed positions table for automatic trade extraction
    observeClosedPositionsTable()

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'FORCE_REFRESH') {
        trackAccountData()
        sendResponse({success: true})
      }
      
      if (message.type === 'DEBUG_EXTRACT') {
        const data = extractAccountData()
        sendResponse({data: data})
      }
      
      if (message.type === 'EXTRACT_TRADES') {
        extractTradeData().then(trades => {
          if (trades) {
            saveTradeData(trades)
          }
          sendResponse({success: true, trades: trades})
        })
        return true // Keep message channel open for async response
      }
      
      if (message.type === 'NAVIGATE_TO_TRADE') {
        console.log('Navigate to trade requested:', message.data)
        navigateToTrade(message.data).then(success => {
          sendResponse({ success })
        })
        return true
      }
      
      if (message.type === 'CLICK_SHOW_ON_CHART') {
        console.log('Click show on chart requested:', message.data)
        clickShowOnChart(message.data.rowIndex).then(success => {
          sendResponse({ success })
        })
        return true
      }
      
      if (message.type === 'DEBUG_EXTRACT') {
        console.log('=== DEBUG EXTRACTION ===')
        
        // Simple direct extraction and console logging
        const tables = document.querySelectorAll('table')
        console.log('Total tables found:', tables.length)
        
        // Look for lib-closed-position-table
        const closedPositionTable = document.querySelector('lib-closed-position-table')
        console.log('lib-closed-position-table found:', !!closedPositionTable)
        
        if (closedPositionTable) {
          const table = closedPositionTable.querySelector('table[fxr-ui-table]')
          console.log('table[fxr-ui-table] found:', !!table)
          
          if (table) {
            const rows = table.querySelectorAll('tbody tr')
            console.log('Data rows found:', rows.length)
            
            const extractedData = []
            
            rows.forEach((row, index) => {
              const cells = row.querySelectorAll('td')
              console.log(`Row ${index}: ${cells.length} cells`)
              
              if (cells.length >= 10) {
                const rowData = {
                  rowIndex: index,
                  cellCount: cells.length,
                  cells: Array.from(cells).map((cell, cellIndex) => ({
                    index: cellIndex,
                    text: cell.textContent?.trim() || '',
                    html: cell.innerHTML?.substring(0, 100) + '...'
                  }))
                }
                extractedData.push(rowData)
              }
            })
            
            console.log('=== EXTRACTED DATA AS JSON ===')
            console.log(JSON.stringify(extractedData, null, 2))
            
            sendResponse({success: true, data: extractedData, debug: true})
          } else {
            console.log('No table[fxr-ui-table] found inside lib-closed-position-table')
            sendResponse({success: false, error: 'No table found'})
          }
        } else {
          console.log('No lib-closed-position-table found')
          sendResponse({success: false, error: 'No closed position table found'})
        }
        
        return true // Keep message channel open for async response
      }
    })

    // Watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let hasTableChanges = false
      let hasAccountChanges = false

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Check for table changes
          if (mutation.target.tagName === "TABLE" ||
              mutation.target.tagName === "TBODY" ||
              mutation.target.closest("table")) {
            hasTableChanges = true
          }
          
          // Check for account section changes
          if (mutation.target.classList?.contains('select-none') ||
              mutation.target.closest('.select-none') ||
              mutation.target.textContent?.includes('Account Balance') ||
              mutation.target.textContent?.includes('Realized PnL')) {
            hasAccountChanges = true
          }
        }
      })

      if (hasTableChanges) {
        addDurationColumn()
      }
      
      if (hasAccountChanges) {
        // Debounce account tracking
        clearTimeout(window.accountTrackingTimeout)
        window.accountTrackingTimeout = setTimeout(trackAccountData, 500)
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