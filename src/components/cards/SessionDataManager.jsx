import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Upload, Database } from "lucide-react";
import useAppStore from "@/store/useAppStore";
import ImportDialog from "../analytics/ImportDialog";

const SessionDataManager = ({ sessionId }) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const exportAllData = useAppStore((state) => state.exportAllData);

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      const shortSessionId = sessionId ? sessionId.slice(-8) : "unknown";
      link.download = `rewynd-${shortSessionId}-${timestamp}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export session data. Please try again.");
    }
  };

  const handleImport = () => {
    setDropdownOpen(false);
    setImportDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-medium"
          >
            <Database className="h-3 w-3 mr-1.5" />
            Import/Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="h-3 w-3 mr-2" />
            Import Session Data
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExport}>
            <Download className="h-3 w-3 mr-2" />
            Export Session data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </>
  );
};

export default SessionDataManager;
