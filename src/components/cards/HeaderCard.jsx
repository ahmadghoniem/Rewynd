import React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Settings, Sun, Moon } from "lucide-react"
import { useTheme } from "../../ThemeContext"
import ConfigurationDialog from "../ConfigurationDialog"

const HeaderCard = ({ onRefreshData, onAddSampleData, onSaveConfig }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-background border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-foreground">
              FxReplay Funded
            </h1>
          </div>

          {/* Buttons on the right */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshData}
              className="h-9 px-3"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onAddSampleData}
              className="h-9 px-3"
              title="Add Sample Data"
            >
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sample Data</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 px-3"
              title="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <ConfigurationDialog onSave={onSaveConfig} />
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderCard
