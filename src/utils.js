// utils.js - Utility functions for trade duration calculator

function calculateDuration(startDateStr, endDateStr) {
  const parseDate = (dateStr) => {
    const date = new Date(dateStr.trim())
    return isNaN(date.getTime()) ? null : date
  }

  const startDate = parseDate(startDateStr)
  const endDate = parseDate(endDateStr)

  if (!startDate || !endDate) return "Invalid"

  const diffMs = endDate - startDate
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${days > 0 ? days + "d " : ""}${
    days > 0 || hours > 0 ? hours + "h " : ""
  }${minutes}m`
}

function getCellText(cell) {
  return (cell.querySelector("div") || cell).textContent.trim()
}

function createDurationCell(duration) {
  const cell = document.createElement("td")
  cell.className =
    "text-sm text-fxr-text-primary dark:text-fxr-text-primary-dark p-3"
  cell.textContent = duration
  return cell
}

function createDurationHeader() {
  const header = document.createElement("th")
  header.className = "text-base p-3"
  header.textContent = "Duration"
  return header
}
