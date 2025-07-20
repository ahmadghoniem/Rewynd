// Debug script for table detection
// Run this in the browser console on the FxReplay page

console.log('=== TABLE DETECTION DEBUG ===')

// Find all tables
const tables = document.querySelectorAll('table')
console.log('Total tables found:', tables.length)

// Analyze each table
tables.forEach((table, index) => {
  console.log(`\n--- Table ${index + 1} ---`)
  console.log('Classes:', table.className)
  console.log('Attributes:', Array.from(table.attributes).map(attr => `${attr.name}="${attr.value}"`))
  
  // Check for headers
  const headers = table.querySelectorAll('th')
  console.log('Headers found:', headers.length)
  if (headers.length > 0) {
    console.log('Header text:', Array.from(headers).map(th => th.textContent?.trim()))
  }
  
  // Check for rows
  const rows = table.querySelectorAll('tbody tr')
  console.log('Data rows found:', rows.length)
  
  // Check first few rows for content
  if (rows.length > 0) {
    console.log('First row cells:', Array.from(rows[0].querySelectorAll('td')).map(td => td.textContent?.trim()))
  }
  
  // Check if this looks like a trades table
  const tableText = table.textContent
  const hasAsset = tableText.includes('BTCUSD') || tableText.includes('ETHUSD') || tableText.includes('GBPUSD')
  const hasRealized = tableText.includes('Realized')
  const hasAssetHeader = Array.from(headers).some(th => th.textContent?.trim().includes('Asset'))
  const hasRealizedHeader = Array.from(headers).some(th => th.textContent?.trim().includes('Realized'))
  
  console.log('Looks like trades table:', {
    hasAsset,
    hasRealized,
    hasAssetHeader,
    hasRealizedHeader,
    isLikelyTradesTable: (hasAsset && hasRealized) || (hasAssetHeader && hasRealizedHeader)
  })
})

// Look specifically for the fxr-ui-table
const fxrTable = document.querySelector('table[fxr-ui-table]')
if (fxrTable) {
  console.log('\n--- Found fxr-ui-table ---')
  console.log('Headers:', Array.from(fxrTable.querySelectorAll('th')).map(th => th.textContent?.trim()))
  console.log('Rows:', fxrTable.querySelectorAll('tbody tr').length)
} else {
  console.log('\n--- No fxr-ui-table found ---')
}

// Look for lib-closed-position-table component
const closedPositionTable = document.querySelector('lib-closed-position-table')
if (closedPositionTable) {
  console.log('\n--- Found lib-closed-position-table ---')
  const table = closedPositionTable.querySelector('table[fxr-ui-table]')
  if (table) {
    console.log('Table inside lib-closed-position-table:')
    console.log('Headers:', Array.from(table.querySelectorAll('th')).map(th => th.textContent?.trim()))
    console.log('Rows:', table.querySelectorAll('tbody tr').length)
    
    // Show first row data
    const firstRow = table.querySelector('tbody tr')
    if (firstRow) {
      console.log('First row cells:', Array.from(firstRow.querySelectorAll('td')).map(td => td.textContent?.trim()))
    }
  }
} else {
  console.log('\n--- No lib-closed-position-table found ---')
}

// Look for div with overflow-x-auto containing table
const overflowDivs = document.querySelectorAll('div.overflow-x-auto')
console.log('\n--- Overflow divs ---')
overflowDivs.forEach((div, index) => {
  const table = div.querySelector('table')
  if (table) {
    console.log(`Overflow div ${index + 1} contains table with ${table.querySelectorAll('tbody tr').length} rows`)
  }
})

console.log('\n=== END DEBUG ===') 