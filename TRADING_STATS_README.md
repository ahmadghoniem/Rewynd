# Trading Statistics Feature

This Chrome extension now includes comprehensive trading statistics analysis based on the FxReplay closed positions table.

## Features Added

### 1. Trade Data Extraction
- **Automatic Detection**: The extension automatically detects the FxReplay closed positions table
- **Data Parsing**: Extracts all relevant trade information including:
  - Asset (e.g., BTCUSD, ETHUSD)
  - Side (buy/sell)
  - Entry and exit prices
  - Risk-reward ratios
  - Trade duration
  - Realized P&L
  - Position sizes

### 2. Trading Statistics Table
The extension calculates and displays the following metrics:

#### Core Statistics
- **Average RR (Risk-Reward)**: Average risk-reward ratio across all trades
- **Average Profit**: Average profit from winning trades
- **Average Loss**: Average loss from losing trades
- **Best Win**: Largest single winning trade
- **Trades per Day**: Average number of trades per trading day
- **Max Daily Loss**: Largest single-day loss
- **Average Duration**: Average trade duration
- **Win Rate**: Percentage of winning trades

#### Visual Indicators
- Color-coded values (green for positive, red for negative)
- Status badges indicating performance quality
- Progress indicators for key metrics

### 3. Data Management
- **Real-time Extraction**: Extract trade data directly from FxReplay pages
- **Persistent Storage**: Data is stored in Chrome extension storage and localStorage
- **Account Size Tracking**: Monitor account size and performance metrics
- **Cross-tab Updates**: Real-time updates across multiple extension tabs

## How to Use

### 1. Extract Real Trade Data
1. Navigate to the FxReplay closed positions page
2. Open the extension analytics dashboard
3. Click "Extract Trades" in the Trade Data Extraction section
4. The extension will automatically parse the table and calculate statistics



### 3. View Statistics
- All statistics are automatically calculated and displayed in the Trading Statistics table
- Metrics update in real-time as new data is extracted
- Historical data is preserved between sessions

### 4. View Trade Data
- The complete trade data is displayed in a detailed table below the statistics
- Shows all extracted trade information in a readable format
- Color-coded P&L values and status indicators

## Troubleshooting

### If Trade Extraction Fails

1. **Check Console**: Open browser developer tools (F12) and check the console for error messages
2. **Use Debug Button**: Click the "Debug" button in the Trade Data Extraction section to get detailed information
3. **Run Debug Script**: Copy and paste the contents of `debug-table-detection.js` into the browser console on the FxReplay page
4. **Verify Page**: Ensure you're on the correct FxReplay page with the closed positions table visible
5. **Refresh Page**: Try refreshing the FxReplay page and extracting again

### Common Issues

- **No tables found**: The page might not be fully loaded, wait a moment and try again
- **Wrong table detected**: The extension might be detecting a different table, use the debug tools to identify the correct one
- **Permission issues**: Ensure the extension has permission to access the FxReplay site
- **Network issues**: Check if the FxReplay site is loading properly

## Technical Implementation

### Components Created
1. **TradingStatsTable.jsx**: Main statistics display component
2. **TradeDataExtractor.jsx**: Trade data extraction and management


### Data Flow
1. Content script detects and extracts trade data from FxReplay tables
2. Data is sent to background script for storage
3. Analytics component receives updates via Chrome messaging
4. Statistics are calculated and displayed in real-time

### Storage
- **Chrome Extension Storage**: Primary storage for trade data
- **localStorage**: Backup storage for persistence
- **Cross-tab Communication**: Real-time updates across extension instances

## Sample Data Structure

```javascript
{
  asset: "BTCUSD",
  side: "sell",
  dateStart: "7/06/25, 5:58 PM",
  dateEnd: "7/06/25, 9:27 PM",
  entry: "108894.38000",
  initialSL: "109146.17",
  maxTP: "108565.65",
  maxRR: "1.31",
  size: "0.6 lot",
  closeAvg: "108565.64667",
  realized: "$197.24",
  commission: "$0.00",
  duration: "25m"
}
```

## Performance Metrics

The extension calculates comprehensive performance metrics including:

- **Risk Management**: Max daily loss tracking
- **Efficiency**: Trades per day and average duration
- **Profitability**: Win rate and average profit/loss
- **Risk-Reward**: Average RR ratios and best trades

## Browser Compatibility

- Chrome/Chromium browsers
- Requires active tab on FxReplay.com for data extraction
- Works offline with previously extracted data

## Future Enhancements

Potential improvements for future versions:
- Export functionality for trade data
- Advanced filtering and sorting
- Performance charts and graphs
- Integration with other trading platforms
- Custom metric calculations 