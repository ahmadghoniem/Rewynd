// content.js - Enhanced content script with account tracking


(function () {
  // ============================================
  // CONSTANTS & CONFIGURATION
  // ============================================
  const SELECTORS = {
    ACCOUNT_SECTION: "div.hidden.lg\\:\\!flex.justify-end.items-center.gap-4.w-full.grow",
    ACCOUNT_SPAN: "span.select-none.text-sm",
    TAB_LIST: ".p-tablist-tab-list",
    CLOSED_POSITION_TABLE: "lib-closed-position-table",
    PAGINATION_BAR: "fxr-ui-pagination-bar",
    TABLE: "table[fxr-ui-table]",
    OVERLAY: "fxr-ui-card.max-h-80.ng-star-inserted"
  };

  const TIMING = {
    DEBOUNCE_TRACKING: 300,
    DEBOUNCE_EXTRACTION: 500,
    PAGE_NAVIGATION: 25,
    TABLE_UPDATE_CHECK: 50,
    TABLE_UPDATE_TIMEOUT: 500
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  let accountObserver = null;
  let extractionTimeout = null;
  let isExtracting = false;

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  // Creates a debouncer that delays function execution
  function createDebouncer(delay) {
    let timeout;
    return (fn) => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay);
    };
  }

  const debounceExtraction = createDebouncer(TIMING.DEBOUNCE_EXTRACTION);
  const debounceTracking = createDebouncer(TIMING.DEBOUNCE_TRACKING);

  // Gets account section with fresh DOM query
  function getAccountSection() {
    return document.querySelector(SELECTORS.ACCOUNT_SECTION);
  }

  // Parses numeric value from text like "Account Balance: $1,234.56"
  function parseNumericValue(text, label) {
    const regex = new RegExp(`${label}:\\s*-?\\$?([\\d,.]+)`, "i");
    const match = text.match(regex);
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, ""));
      return text.includes("-") ? -Math.abs(value) : value;
    }
    return null;
  }

  // Sends message to background script and returns promise
  function sendToBackground(type, data) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type, data }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Creates lightweight snapshot of table for comparison
  function getTableSnapshot(tableBody) {
    if (!tableBody) return "";
    const rows = tableBody.querySelectorAll("tr");
    return `${rows.length}-${rows[0]?.innerText || ""}`;
  }

  // ============================================
  // PAGINATION MANAGER
  // ============================================
  const Pagination = {
    // Gets pagination button (prev/next)
    getButton(type) {
      const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
      return table?.querySelector(`button[data-test="${type}"]`);
    },

    // Returns current page number
    getCurrentPage() {
      const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
      const spans = table?.querySelectorAll("button[fxr-ui-button] span");
      if (spans && spans.length >= 2) {
        const pageNumber = parseInt(spans[1].textContent.trim());
        return isNaN(pageNumber) ? 1 : pageNumber;
      }
      return 1;
    },

    // Returns total number of pages
    getTotalPages() {
      const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
      const match = table?.textContent.match(/of (\d+)/);
      return match ? parseInt(match[1]) : 1;
    },

    // Navigates to specific page number
    async goToPage(targetPage) {
      let current = this.getCurrentPage();
      if (current === targetPage) return;

      const direction = targetPage < current ? "prev" : "next";
      const button = this.getButton(direction);
      if (!button) return;

      const steps = Math.abs(targetPage - current);
      for (let i = 0; i < steps; i++) {
        if (button.disabled) break;
        button.click();
        await new Promise(resolve => setTimeout(resolve, TIMING.PAGE_NAVIGATION));
        current = this.getCurrentPage();
        if (current === targetPage) break;
      }
    },

    // Clicks next button and returns success status
    goToNext() {
      const button = this.getButton("next");
      if (button && !button.disabled) {
        button.click();
        return true;
      }
      return false;
    }
  };

  // ============================================
  // SESSION DATA EXTRACTION
  // ============================================

  // Extracts account balance, realized P&L, and calculates initial capital
  function extractSessionData() {
    const section = getAccountSection();
    if (!section) return null;

    const spans = section.querySelectorAll(SELECTORS.ACCOUNT_SPAN);
    const data = { accountBalance: null, realizedPnL: null };

    // Loop through spans to find balance and P&L
    for (const span of spans) {
      const text = span.textContent.trim();
      const lowerText = text.toLowerCase();

      if (!data.accountBalance && lowerText.includes("account balance:")) {
        data.accountBalance = parseNumericValue(text, "Account Balance");
      }

      if (!data.realizedPnL && lowerText.includes("realized pnl:")) {
        data.realizedPnL = parseNumericValue(text, "Realized PnL");
      }

      // Exit early when both values found
      if (data.accountBalance !== null && data.realizedPnL !== null) break;
    }

    return {
      id: window.location.pathname.split("/").pop(),
      balance: data.accountBalance,
      realizedPnL: data.realizedPnL ?? 0,
      capital: data.accountBalance !== null && data.realizedPnL !== null
        ? Math.round(data.accountBalance - data.realizedPnL)
        : data.accountBalance,
      lastUpdated: Date.now()
    };
  }

  // Tracks session data changes and triggers trade extraction
  function trackSessionData() {
    const data = extractSessionData();
    if (!data) return;

    // Send session data to background
    sendToBackground("SESSION_DATA_UPDATE", data).catch(error => {
      console.error("Error saving session data:", error);
    });

    // Prevent race conditions by checking flag before debouncing
    if (isExtracting) return;

    isExtracting = true;
    debounceExtraction(() => {
      extractTradeHistory(false)
        .then(trades => {
          if (trades) {
            return sendToBackground("TRADE_DATA_UPDATE", {
              trades,
              forceRefresh: false,
              lastUpdated: Date.now(),
              url: window.location.href
            });
          }
        })
        .catch(error => {
          console.error("Error extracting trades after account change:", error);
        })
        .finally(() => {
          isExtracting = false;
        });
    });
  }

  // ============================================
  // TRADE HISTORY EXTRACTION
  // ============================================

  // Switches UI to "Closed positions" tab
  function switchToClosedPositionsTab() {
    const tabList = document.querySelector(SELECTORS.TAB_LIST);
    if (!tabList) return false;

    const tabs = tabList.querySelectorAll("p-tab");
    const closedPositionsTab = Array.from(tabs).find(
      tab => tab.textContent?.toLowerCase().includes("closed positions")
    );

    if (!closedPositionsTab) return false;
    if (closedPositionsTab.getAttribute("data-p-active") === "true") return true;

    closedPositionsTab.click();
    return true;
  }

  // Sets pagination to show maximum rows per page
  function setRowsPerPageToMax() {
    const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
    const paginationBar = table?.querySelector(SELECTORS.PAGINATION_BAR);
    const button = paginationBar?.querySelector("button[cdkoverlayorigin]");

    if (!button) return false;
    button.click();

    const overlay = document.querySelector(SELECTORS.OVERLAY);
    const options = overlay?.querySelectorAll("button");

    if (options && options.length > 0) {
      options[options.length - 1].click();
    }

    return true;
  }

  // Extracts trade data from visible table rows
  function extractTradesFromCurrentPage() {
    const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
    const rows = table?.querySelectorAll("tbody tr") || [];

    return Array.from(rows).map((row, rowIndex) => {
      const cells = row.querySelectorAll("td");
      return {
        rowIndex,
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
      };
    });
  }

  // Waits for table DOM to update with simple timeout loop
  async function waitForTableUpdate(tableBody, oldSnapshot, maxWaitMs = TIMING.TABLE_UPDATE_TIMEOUT) {
    if (!tableBody) return false;

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      await new Promise(resolve => setTimeout(resolve, TIMING.TABLE_UPDATE_CHECK));

      const newSnapshot = getTableSnapshot(tableBody);
      if (newSnapshot !== oldSnapshot) return true;
    }

    console.warn("Table update timeout reached");
    return false;
  }

  // Extracts trades from all pages or just current page
  async function extractAllTrades(forceRefresh) {
    const allTrades = [];
    const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
    const tableBody = table?.querySelector("tbody");

    // Always start from page 1
    await Pagination.goToPage(1);

    if (forceRefresh) {
      const totalPages = Pagination.getTotalPages();

      for (let page = 1; page <= totalPages; page++) {
        // Only navigate if not first page
        if (page > 1) {
          const oldSnapshot = getTableSnapshot(tableBody);
          if (!Pagination.goToNext()) break;
          await new Promise(resolve => setTimeout(resolve, TIMING.TABLE_UPDATE_CHECK));
          await waitForTableUpdate(tableBody, oldSnapshot);
        }

        const pageTrades = extractTradesFromCurrentPage();
        allTrades.push(...pageTrades);
      }

      // Return to page 1
      await Pagination.goToPage(1);
    } else {
      // Extract only current page
      const pageTrades = extractTradesFromCurrentPage();
      allTrades.push(...pageTrades);
    }

    return allTrades;
  }

  // Main entry point for trade extraction
  async function extractTradeHistory(forceRefresh = false) {
    const tabSwitched = switchToClosedPositionsTab();
    if (!tabSwitched) return null;

    const table = document.querySelector(SELECTORS.CLOSED_POSITION_TABLE);
    if (!table?.querySelector(SELECTORS.TABLE)) return null;

    setRowsPerPageToMax();
    return await extractAllTrades(forceRefresh);
  }

  // ============================================
  // OBSERVERS & LIFECYCLE
  // ============================================

  // Sets up observer to watch for account balance changes
  function setupAccountObserver() {
    // Clean up existing observer to prevent duplicates
    if (accountObserver) {
      accountObserver.disconnect();
      accountObserver = null;
    }

    const accountSection = getAccountSection();
    if (!accountSection) {
      alert("Account section not found. Please refresh the page.");
      // sendToBackground("SHOW_NOTIFICATION", {
      //   type: "warning",
      //   message: "Account section not found. Please refresh the page."
      // }).catch(console.error);
      return;
    }

    const span = accountSection.querySelector(SELECTORS.ACCOUNT_SPAN);
    if (!span) {
      console.warn("No span found in account section");
      return;
    }

    // Watch for text changes in the span
    accountObserver = new MutationObserver(() => {
      debounceTracking(() => trackSessionData());
    });

    accountObserver.observe(span, {
      characterData: true,
      subtree: true,
      childList: true
    });

    // Notify background that observer is active
    sendToBackground("OBSERVER_STATUS_UPDATE", { isObserving: true }).catch(
      error => console.error("Error updating observer status:", error)
    );
  }

  // Cleans up observers and timeouts on page unload
  function cleanup() {
    if (accountObserver) {
      accountObserver.disconnect();
      accountObserver = null;

      // Update sync status to false when observer stops
      sendToBackground("SYNC_STATUS_UPDATE", false).catch(
        error => console.error("Error updating sync status:", error)
      );
    }

    if (extractionTimeout) {
      clearTimeout(extractionTimeout);
      extractionTimeout = null;
    }

    isExtracting = false;
  }

  // ============================================
  // MESSAGE HANDLERS
  // ============================================

  // Map of message types to handler functions
  const messageHandlers = {
    // Extracts trades when requested by popup/background
    async EXTRACT_TRADES({ forceRefresh = false }) {
      if (isExtracting) {
        throw new Error("Extraction already in progress");
      }

      isExtracting = true;
      try {
        const trades = await extractTradeHistory(forceRefresh);
        if (trades) {
          await sendToBackground("TRADE_DATA_UPDATE", {
            trades,
            forceRefresh,
            lastUpdated: Date.now(),
            url: window.location.href
          }).catch(error => {
            console.error("Error saving trade data:", error);
          });
        }
        return { success: true, trades };
      } finally {
        isExtracting = false;
      }
    },

    // Extracts session data when requested
    async EXTRACT_SESSION_DATA() {
      const data = extractSessionData();
      if (!data) {
        throw new Error("Failed to extract session data");
      }

      // Save session data to background storage
      await sendToBackground("SESSION_DATA_UPDATE", data).catch(error => {
        console.error("Error saving session data:", error);
      });

      return { success: true, data };
    },

    // Sets up observer when user clicks sync button
    MANUAL_SYNC() {
      setupAccountObserver();
      return { success: true };
    },

    // Stops the observer when session changes or manually requested
    STOP_OBSERVER() {
      if (accountObserver) {
        accountObserver.disconnect();
        accountObserver = null;
        currentSessionId = null;
        sendToBackground("SYNC_STATUS_UPDATE", false).catch(error =>
          console.error("Error updating sync status:", error)
        );
      }
      return { success: true };
    }
  };

  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const handler = messageHandlers[message.type];
    if (!handler) return false;

    // Execute handler and send response
    Promise.resolve(handler(message))
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }));

    return true; // Keep message channel open for async response
  });

  // ============================================
  // INITIALIZATION
  // ============================================

  window.addEventListener("beforeunload", cleanup);
  window.addEventListener("unload", cleanup);
})();
