# Chrome Extension Files

This folder contains the Chrome extension-specific files that are separate from the React application.

## Files

- **background.js** - Background service worker that handles storage and messaging
- **content.js** - Content script that runs on FxReplay pages to extract data
- **utils.js** - Utility functions for trade data processing and duration calculations

## Build Process

These files are copied to the `dist/` folder during the build process using `build-extension.js` (located in this folder).

## Manifest Configuration

The extension manifest references these files from their new location in `src/extension/`.
