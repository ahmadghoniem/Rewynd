# FxReplay Funded - Trading Analytics Dashboard

A comprehensive Chrome extension and web application for analyzing FxReplay trading challenge performance with real-time data extraction, advanced analytics, and objective tracking.

![FxReplay Funded Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v3-orange)
![License](https://img.shields.io/badge/License-MIT-green)
<img width="985" height="1030" alt="Screenshot 2025-08-19 012319" src="https://github.com/user-attachments/assets/b520f4d3-7951-49f0-8965-756eb31367b7" />

## 🚀 Features

### 📊 Real-Time Analytics

- **Live Account Tracking**: Automatically extracts and monitors account balance, realized PnL, and capital
- **Trade History Analysis**: Comprehensive trade data extraction with detailed performance metrics
- **Performance Metrics**: Win rate, profit factor, average RR, trader expectancy, and more
- **Equity Curve Visualization**: Interactive charts showing account growth over time

### 🎯 Challenge Objective Tracking

- **Minimum Trading Days**: Track required trading days for challenge completion
- **Minimum Profitable Days**: Monitor profitable trading days requirement
- **Profit Targets**: Real-time progress tracking toward profit goals
- **Consistency Rule**: Ensure profits are spread across multiple days
- **Daily Drawdown Monitoring**: Track daily loss limits
- **Maximum Drawdown**: Monitor overall account drawdown with static/trailing options

### 🔧 Advanced Configuration

- **Customizable Parameters**: Adjust all challenge requirements to match your specific program
- **Multiple Drawdown Types**: Support for static, trailing fixed, and trailing scaling drawdown
- **Preset Management**: Save and load different challenge configurations
- **Real-time Updates**: Automatic synchronization across browser tabs

### 💾 Data Management

- **Import/Export**: Backup and restore your trading data and configurations
- **Notes System**: Add personal notes and observations
- **Sample Data**: Test the application with provided sample trading data
- **Cross-tab Sync**: Seamless data synchronization across multiple browser tabs

### 🎨 User Experience

- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Responsive Design**: Optimized for desktop and mobile viewing
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Real-time Status**: Visual indicators for challenge progress and status

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0** - Modern React with latest features
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **Zustand 5.0.6** - Lightweight state management
- **Recharts 2.15.4** - Data visualization library
- **Radix UI** - Accessible component primitives
- **Lexical** - Rich text editor for notes

### Chrome Extension

- **Manifest V3** - Latest Chrome extension manifest
- **Content Scripts** - Real-time data extraction from FxReplay
- **Background Service Worker** - Data storage and synchronization
- **Chrome Storage API** - Persistent data storage

### Development Tools

- **Vite 7.0.4** - Fast build tool and development server
- **ESLint** - Code linting and formatting
- **TypeScript** - Type safety and better development experience

## 📦 Installation

### Prerequisites

- Node.js 18+
- Chrome browser
- Active FxReplay account

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/FxReplayFunded.git
   cd FxReplayFunded
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build the Chrome extension**
   ```bash
   npm run build:extension
   ```

### Chrome Extension Installation

1. **Load the extension**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

2. **Access the dashboard**
   - Click the extension icon in your Chrome toolbar
   - Or navigate to the extension's popup page

## 🚀 Usage

### Initial Setup

1. **Open FxReplay Dashboard**

   - Navigate to your FxReplay challenge dashboard
   - Ensure you're logged in and can see your trading data

2. **Configure Challenge Parameters**

   - Click the "Configuration" button in the analytics dashboard
   - Set your specific challenge requirements:
     - Minimum trading days
     - Minimum profitable days
     - Profit targets
     - Daily drawdown limits
     - Maximum drawdown limits
     - Consistency rule percentage

3. **Extract Trading Data**
   - Click "Refresh Data" to extract current account and trade data
   - Or use "Sample Data" to test with provided example data

### Daily Usage

1. **Monitor Progress**

   - View real-time account balance and PnL
   - Check objective completion status
   - Monitor drawdown levels

2. **Analyze Performance**

   - Review trade history and statistics
   - Analyze equity curve progression
   - Check consistency rule compliance

3. **Manage Data**
   - Add notes for important observations
   - Export data for backup
   - Import data when switching devices

## 📊 Key Metrics Explained

### Performance Metrics

- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Ratio of gross profit to gross loss
- **Average RR**: Average risk-to-reward ratio
- **Trader Expectancy**: Expected profit per trade

### Challenge Objectives

- **Minimum Trading Days**: Required number of days with at least one trade
- **Minimum Profitable Days**: Required number of days with net profit
- **Profit Targets**: Percentage profit required to complete challenge
- **Consistency Rule**: Maximum percentage of total profits from a single day
- **Daily Drawdown**: Maximum allowed daily loss percentage
- **Maximum Drawdown**: Overall account drawdown limit

## 🔧 Configuration Options

### Drawdown Types

- **Static**: Fixed percentage based on initial capital
- **Trailing Fixed**: Percentage based on current balance
- **Trailing Scaling**: Percentage that scales with account growth

### Data Management

- **Auto-sync**: Automatic data extraction when account changes
- **Manual Refresh**: Force refresh all data
- **Import/Export**: Backup and restore functionality
- **Cross-tab Sync**: Real-time updates across browser tabs

## 🏗️ Project Structure

```
FxReplayFunded/
├── src/
│   ├── components/
│   │   ├── analytics/          # Analytics dashboard components
│   │   ├── cards/             # Individual metric cards
│   │   ├── configuration/     # Challenge configuration UI
│   │   ├── editor/           # Rich text editor components
│   │   └── ui/               # Reusable UI components
│   ├── extension/            # Chrome extension files
│   │   ├── background.js     # Background service worker
│   │   ├── content.js        # Content script for data extraction
│   │   └── utils.js          # Extension utilities
│   ├── lib/                  # Utility functions
│   ├── store/                # Zustand state management
│   └── assets/               # Static assets
├── public/                   # Public assets and fonts
├── dist/                     # Built extension files
└── manifest.json            # Chrome extension manifest
```

## 🔌 API Integration

### FxReplay Data Extraction

The extension automatically extracts data from FxReplay's web interface:

- Account balance and PnL
- Trade history with detailed metrics
- Real-time updates via DOM observation

### Data Storage

- **Chrome Storage**: Persistent storage for all user data
- **Cross-tab Communication**: Real-time data synchronization
- **Export/Import**: JSON-based data portability

## 🚨 Important Notes

### Browser Compatibility

- **Chrome/Chromium**: Full support
- **Firefox**: Limited support (extension API differences)
- **Safari**: Not supported (different extension model)

### Data Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Export/import functionality is client-side only

### FxReplay Integration

- Requires active FxReplay account
- Works with standard FxReplay challenge programs
- May require updates if FxReplay changes their interface

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure cross-browser compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FxReplay** for providing the trading platform
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Chrome Extension Community** for documentation and examples

## 📞 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Discussions**: Join community discussions
- **Documentation**: Check the wiki for detailed guides

## 🔄 Changelog

### Version 1.0.0

- Initial release with core analytics features
- Chrome extension with real-time data extraction
- Comprehensive challenge objective tracking
- Import/export functionality
- Dark/light theme support

---

**Disclaimer**: This tool is for educational and analytical purposes only. Trading involves risk, and past performance does not guarantee future results. Always follow your broker's terms and conditions.
