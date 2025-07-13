// main.js - Main duration calculator script
// Requires: utils.js

;(function () {
  console.clear()
  console.log("Trade Duration Calculator - Duration Column Only")

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
    addDurationColumn()

    // Watch for table changes
    new MutationObserver((mutations) => {
      const hasTableChanges = mutations.some(
        (mutation) =>
          mutation.type === "childList" &&
          (mutation.target.tagName === "TABLE" ||
            mutation.target.tagName === "TBODY" ||
            mutation.target.closest("table"))
      )

      if (hasTableChanges) addDurationColumn()
    }).observe(document.body, { childList: true, subtree: true })
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init()
})()
