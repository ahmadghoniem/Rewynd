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

    // Calculate initial capital
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
    if (!data.balance) {
      console.log("No valid account data to save")
      return
    }

    try {
      // Send to background script
      chrome.runtime.sendMessage({
        type: 'ACCOUNT_DATA_UPDATE',
        data: data
      }, (response) => {
        if (response && response.success) {
          console.log("Account data saved:", data)
        }
      })
      
      // Backup to localStorage
      localStorage.setItem('tradeAnalytics_accountData', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving account data:', error)
    }
  }

  function trackAccountData() {
    const data = extractAccountData()
    if (data) {
      saveAccountData(data)
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

    function init() {
    // Initialize duration column functionality
    addDurationColumn()
    
    // Initial account tracking
    trackAccountData()

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