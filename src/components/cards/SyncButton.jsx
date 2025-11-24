import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import useAppStore from "@/store/useAppStore"

const SyncButton = () => {
  const isInSync = useAppStore((state) => state.isInSync)
  const handleSync = useAppStore((state) => state.handleSync)

  // When synced: show just an icon button for re-sync
  // When not synced: show button with "Sync" text
  if (isInSync) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        className="h-8 px-2 text-xs font-medium"
        title="Re-sync data"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleSync}
      className="h-8 px-3 text-xs font-medium"
      title="Sync with FxReplay"
    >
      <RefreshCw className="h-3 w-3 mr-1.5" />
      Sync
    </Button>
  )
}

export default SyncButton
