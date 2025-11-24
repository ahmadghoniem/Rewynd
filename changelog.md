# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [unreleased] - YYYY-MM-DD

- consistent formatting across all files
- share button so you could share your trading session preview on social media
- layout shift when showing filters
- use toast notifications instead of alerts!
- improve file structure 

## [1.0.0] - 2025-11-24

### Added
- Added a legend and empty-state placeholder to the Win Rate Radial chart.
- Added breakeven trades as a third segment in the Win Rate Radial chart.
- Added empty placeholder cards to preserve the three-card layout structure and maintain UI stability.
### Changed
- Refactored data synchronization from Message-Based Updates (manual 4-message chain: content sends → background saves → notifies popup → popup re-fetches) to Storage Event-Based Updates (storage changes broadcast automatically via Chrome's native chrome.storage.onChanged API).
- Switched from automatic on-load sync to manual user-initiated sync for more reliable data extraction.
- Updated the import flow to open the file picker directly, skipping the preview modal for faster selection.
- Updated streak calculation logic to exclude breakeven trades.
- Reverted the Consistency Rule to begin calculating only after meeting the minimum trading-day requirement.
- Refactored the Zustand store into modular slices.
- Simplified profit targets to a single numeric value, removing phase-based target objects.
- Reorganized configuration settings to follow a more logical user flow.
- Updated daily calculations to group trades strictly by their close date.
- Improved the visual design of empty-state placeholders.
- Moved the donation link into a floating action button.
- Updated all storage keys to use consistent naming conventions.
### Removed
- Removed the `localStorage` fallback.
### Fixed
- Fixed breakeven trades incorrectly labeled as "Loss" and shown as -1 R/R due to early return logic.
- Fixed trade display order reversing after import.
- Fixed daily recap cards persisting after switching to a new session.
- Fixed trades-per-day grouping splitting same-day trades due to UTC conversion by implementing `getLocalDateKey`.
- Fixed premature-exit risk percentages incorrectly using realized loss instead of intended risk by applying proportional scaling: (actual loss × SL distance) / close distance.
- Fixed risk percentage calculations using the current account balance instead of the historical balance at the time of trade execution.
- Fixed import functionality in local development environment by directly updating application state instead of relying on Chrome extension storage which is unavailable in webpage context
 
