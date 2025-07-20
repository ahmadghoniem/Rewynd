// Simple extraction script - run this in the browser console on FxReplay
console.log('=== SIMPLE EXTRACTION TEST ===')

// Find the closed position table
const closedPositionTable = document.querySelector('lib-closed-position-table')
console.log('lib-closed-position-table found:', !!closedPositionTable)

if (!closedPositionTable) {
  console.log('❌ No lib-closed-position-table found')
  console.log('Available elements with "closed" in the name:')
  document.querySelectorAll('*').forEach(el => {
    if (el.tagName && el.tagName.toLowerCase().includes('closed')) {
      console.log('Found:', el.tagName, el.className)
    }
  })
} else {
  // Find the table inside
  const table = closedPositionTable.querySelector('table[fxr-ui-table]')
  console.log('table[fxr-ui-table] found:', !!table)
  
  if (!table) {
    console.log('❌ No table[fxr-ui-table] found inside lib-closed-position-table')
    console.log('Available tables inside:')
    closedPositionTable.querySelectorAll('table').forEach((t, i) => {
      console.log(`Table ${i}:`, t.className, t.attributes)
    })
  } else {
    // Get all rows
    const rows = table.querySelectorAll('tbody tr')
    console.log('✅ Data rows found:', rows.length)
    
    if (rows.length === 0) {
      console.log('❌ No data rows found')
      console.log('Available tbody elements:', table.querySelectorAll('tbody').length)
    } else {
      // Extract data from each row
      const extractedTrades = []
      
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td')
        console.log(`Row ${rowIndex}: ${cells.length} cells`)
        
        if (cells.length >= 10) {
          const trade = {
            rowIndex: rowIndex,
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
            commission: cells[12]?.textContent?.trim() || '',
            duration: cells[13]?.textContent?.trim() || ''
          }
          
          // Only add if it has valid data
          if (trade.asset && trade.realized) {
            extractedTrades.push(trade)
            console.log(`✅ Added trade: ${trade.asset} - ${trade.realized}`)
          } else {
            console.log(`❌ Skipped row ${rowIndex}: missing asset or realized P&L`)
          }
        } else {
          console.log(`❌ Row ${rowIndex} has insufficient cells: ${cells.length}`)
        }
      })
      
      console.log('=== FINAL EXTRACTED TRADES ===')
      console.log(JSON.stringify(extractedTrades, null, 2))
      console.log(`Total trades extracted: ${extractedTrades.length}`)
      
      // Also log raw cell data for debugging
      console.log('=== RAW CELL DATA ===')
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td')
        console.log(`Row ${rowIndex}:`, Array.from(cells).map((cell, i) => `${i}: "${cell.textContent?.trim()}"`))
      })
    }
  }
}

console.log('=== EXTRACTION TEST COMPLETE ===') 