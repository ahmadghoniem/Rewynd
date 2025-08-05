# FxReplay Funded - Chrome Extension

A Chrome extension for analyzing trading performance from FxReplay platform.

## Project Structure

```
src/
├── extension/           # Chrome extension files
│   ├── background.js   # Background service worker
│   ├── content.js      # Content script for data extraction
│   ├── utils.js        # Utility functions
│   ├── build-extension.js # Build script for extension files
│   └── README.md       # Extension documentation
├── components/          # React components
├── store/              # State management (Zustand)
├── lib/                # Shared utilities
└── ...                 # Other React app files
```

## Development

- **React App**: Standard Vite + React setup
- **Chrome Extension**: Files in `src/extension/` are built separately
- **Build Process**: Uses `src/extension/build-extension.js` to copy extension files to `dist/`

## Features

- Real-time trade data extraction from FxReplay
- Performance analytics and visualization
- Challenge configuration management
- Dark/light theme support
