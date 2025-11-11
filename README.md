# Rewynd - Trading Analytics Dashboard
Rewynd is a Chrome extension for FxReplay traders who want to go beyond backtesting
—turn your replay sessions into simulated prop firm challenges and practice hitting profit targets, managing drawdowns, and meeting consistency rules to get funded.


![Rewynd Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-v3-orange)
![License](https://img.shields.io/badge/License-MIT-green)


<img width="851" height="910" alt="image" src="https://github.com/user-attachments/assets/42894dd3-aa4e-48e5-81b1-172613a08f03" />
## ✨ Core Features

### 📊 Performance Analytics That Actually Matter

Track what separates funded traders from the rest:

- **Real-time metrics extraction** from FxReplay—account balance, realized PnL, and complete trade history automatically synced
- **Professional-grade statistics**: win rate,Average R/R, profit factor, trader expectancy,average win/loss, win/loss streaks
- **Smarter trade history**—instantly see your risk exposure per trade and hold duration, critical insights you'd otherwise track manually
- **Daily performance snapshots** with instant PnL, R/R, and win rate overview
- **Interactive growth charts** visualizing your account performance over time
- **Built-in trading journal** with Notion-style editor for documenting your edge

### 🎯 Realistic Prop Firm Challenges

Practice like it's the real thing:

- **Match any firm's rules**— fully customizable challenge parameters
- **Complete objective tracking**:
  - Minimum trading days & profitable days
  - Profit targets with live progress bars
  - Daily & maximum drawdown limits (static/trailing)
  - Consistency requirements & rule enforcement
- **Visual status indicators**—know exactly where you stand (active, failed, funded)

### 💾 Privacy-First Data Management

Your edge stays yours:

- 🔒 **100% local storage**—no external servers, no data collection
- 🔄 **Auto-sync after each trade**—always up to date
- 💾 **Complete backup system**—export/import sessions, configs, and notes
- 📊 **CSV export**—analyze your data anywhere
- ⚡ **Manual refresh**—force sync anytime you need it

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
- **Cursor** - Ai enhanced code writinhg features


## 📥 Installation

### For Users

1. **Download the latest release:**
   - Go to [Releases](https://github.com/ahmadghoniem/Rewynd/releases)
   - Download the latest `rewynd-extension.zip`

2. **Extract the ZIP file**

3. **Load the extension:**
   - Open your browser and navigate to the extensions page:
     - Chrome/Brave: `chrome://extensions/`
     - Edge: `edge://extensions/`
     - Opera: `opera://extensions/`
   - Enable "Developer mode" 
   - Click "Load unpacked"
   - Select the extracted dist folder

4. **Access the dashboard:**
   - Click the extension icon in your browser toolbar

### For Developers

#### Prerequisites

- Node.js 18+
- Chromium-based browser (Chrome, Brave, Edge, Opera, etc.)
- Active FxReplay account

#### Development Setup

1. **Clone and install**
```bash
   git clone https://github.com/ahmadghoniem/Rewynd.git
   cd Rewynd
   npm install
```

2. **Build the extension**
```bash
   npm run build:extension
```

3. **Load and use the extension**
   - follow steps 3-4 from the [For Users](#for-users) section above
   
## 🚀 Usage

### Initial Setup

1. **Open FxReplay Dashboard**

   - Navigate to an active FxReplay backtesting session

2. **Configure Challenge Parameters**

   - Click the "Configuration" button in the analytics dashboard
   - Set your specific challenge requirements:
     - Minimum trading days
     - Minimum profitable days
     - Profit targets
     - Daily drawdown limits
     - Maximum drawdown limits
     - Consistency rule percentage

3. **Sync Your Data**
   - Click the Sync button to extract your trading data
   - If the data looks incorrect, simply click Sync again to refresh


## 🏗️ Project Structure

```
Rewynd/
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



## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


---

**Disclaimer**: This tool is for educational and analytical purposes only. Trading involves risk, and past performance does not guarantee future results. Always follow your broker's terms and conditions.
