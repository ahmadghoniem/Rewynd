import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Settings } from "lucide-react"
import useAppStore from "@/store/useAppStore"
import NotesDialog from "../analytics/NotesDialog"
import SessionDataManager from "./SessionDataManager"
import SessionChangeManager from "./SessionChangeManager"
import StatusBadge from "@/components/ui/status-badge"
import SyncButton from "./SyncButton"
import { useTheme } from "@/ThemeContext"
import {
  ThemeToggleButton,
  useThemeTransition
} from "@/components/ui/shadcn-io/theme-toggle-button"

const HeaderCard = ({ showConfiguration, onToggleConfiguration }) => {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { startTransition } = useThemeTransition()
  const capital = useAppStore((state) => state.sessionData.capital)
  const sessionData = useAppStore((state) => state.sessionData)
  const isInSync = useAppStore((state) => state.isInSync)

  // Get session ID from global state
  const sessionId = sessionData?.id

  // Format capital for display (default to 100K if not available)
  const formattedCapital = capital && `${(capital / 1000).toFixed(0)}K`

  // Create the header text with dynamic values
  // Use last 8 characters of session ID for cleaner display
  const shortSessionId = sessionId && sessionId.slice(-8)
  const headerText =
    sessionId && capital && `#${shortSessionId} -$${formattedCapital}`

  const getChallengeStatus = useAppStore((state) => state.getChallengeStatus)

  // Get current badge status
  const badgeStatus = getChallengeStatus()

  const handleThemeToggle = () => {
    startTransition(() => {
      toggleTheme()
    })
  }

  return (
    <>
      <div className="w-full flex items-center justify-between mb-2 p-2.5 border border-border/50 rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Rewynd"
            className="h-8 w-8 flex-shrink-0"
            style={{
              filter: isDark ? "none" : "invert(1)"
            }}
          />
          <div className="h-4 w-px bg-border/50"></div>
          {headerText && (
            <h1 className="text-lg font-semibold text-foreground uppercase">
              {headerText}
            </h1>
          )}
          {isInSync && <StatusBadge status={badgeStatus} className="h-8" />}
          <SyncButton />
        </div>

        <div className="flex items-center gap-2">
          <SessionChangeManager sessionData={sessionData} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotesDialogOpen(true)}
            className="h-8 px-3 text-xs font-medium"
          >
            <FileText className="h-3 w-3 mr-1.5" />
            Notes
          </Button>

          <SessionDataManager sessionId={sessionId} />

          <Button
            variant={showConfiguration ? "default" : "outline"}
            size="sm"
            onClick={onToggleConfiguration}
            className="h-8 px-3 text-xs font-medium"
          >
            <Settings className="h-3 w-3 mr-1.5" />
            Configuration
          </Button>

          <ThemeToggleButton
            theme={isDark ? "dark" : "light"}
            variant="circle-blur"
            start="top-right"
            onClick={handleThemeToggle}
            className="h-8 w-8"
          />
        </div>
      </div>

      <NotesDialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen} />
    </>
  )
}

export default HeaderCard
