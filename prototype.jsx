import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sun, Moon, Check } from "lucide-react";
import useAppStore from "../../store/useAppStore";

const HeaderCard = () => {
  const loadSessionData = useAppStore((state) => state.loadSessionData);
  const loadTradeData = useAppStore((state) => state.loadTradeData);
  const [isSynced, setIsSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!window.chrome?.tabs) {
      alert("Chrome extension messaging not available.");
      return;
    }

    setIsSyncing(true);
    setIsSynced(false);

    try {
      // eslint-disable-next-line no-undef
      const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      // eslint-disable-next-line no-undef
      const [fxReplayTab] = await chrome.tabs.query({
        url: "https://app.fxreplay.com/en-US/auth/chart/*",
      });

      if (!fxReplayTab) {
        alert("Please open a FxReplay tab to refresh data.");
        return;
      }

      // eslint-disable-next-line no-undef
      await chrome.tabs.update(fxReplayTab.id, { active: true });

      const [sessionResponse, tradeResponse] = await Promise.all([
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_SESSION_DATA",
        }),
        // eslint-disable-next-line no-undef
        chrome.tabs.sendMessage(fxReplayTab.id, {
          type: "EXTRACT_TRADES",
          forceRefresh: true,
        }),
      ]);

      if (sessionResponse?.success && tradeResponse?.success) {
        await Promise.all([loadSessionData(), loadTradeData()]);

        try {
          // eslint-disable-next-line no-undef
          await chrome.tabs.sendMessage(fxReplayTab.id, {
            type: "MANUAL_SYNC",
          });
        } catch (syncError) {
          console.warn("Manual sync failed:", syncError.message);
        }

        setIsSynced(true);
        alert("Data refreshed successfully!");

        setTimeout(() => {
          setIsSynced(false);
        }, 3000);
      } else {
        alert(
          "Failed to refresh data. Make sure you have a FxReplay tab open."
        );
      }

      if (currentTab?.id !== fxReplayTab.id) {
        // eslint-disable-next-line no-undef
        await chrome.tabs.update(currentTab.id, { active: true });
      }
    } catch (error) {
      console.error("Error during sync:", error);
      alert("Error during sync. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="bg-background border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on the left */}
          <div className="flex items-center">
            <img src="/logo.png" alt="Rewynd" className="h-full w-32" />
          </div>

          {/* Buttons on the right */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className={`h-9 px-3 ${isSynced ? "text-green-600" : ""}`}
              title={isSynced ? "Last sync successful" : "Sync Data"}
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : isSynced ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">
                {isSyncing ? "Syncing..." : isSynced ? "Synced" : "Sync"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderCard;
