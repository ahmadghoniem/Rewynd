import React from "react"
import AnalyticsView from "./analytics"
import { ThemeProvider } from "./ThemeContext"

const AppContent = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen mx-auto bg-background transition-colors duration-200">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AnalyticsView />
        </main>
      </div>
    </ThemeProvider>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
