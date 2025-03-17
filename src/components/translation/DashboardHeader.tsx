import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Upload, Download, Plus, Globe, Key } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface DashboardHeaderProps {
  onCreateNamespace?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onSettingsOpen?: () => void;
  onManageLanguages?: () => void;
  onApiIntegration?: () => void;
  projectName?: string;
}

const DashboardHeader = ({
  onCreateNamespace = () => {},
  onImport = () => {},
  onExport = () => {},
  onSettingsOpen = () => {},
  onManageLanguages = () => {},
  onApiIntegration = () => {},
  projectName = "Translation Project",
}: DashboardHeaderProps) => {
  return (
    <header className="w-full h-20 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-foreground">{projectName}</h1>
        <div className="h-6 w-px bg-border mx-2" />
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNamespace}
          className="ml-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Namespace
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" onClick={onManageLanguages}>
          <Globe className="h-4 w-4 mr-2" />
          Languages
        </Button>

        <Button variant="outline" onClick={onImport}>
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" onClick={onApiIntegration}>
          <Key className="h-4 w-4 mr-2" />
          API
        </Button>

        <Button variant="ghost" size="icon" onClick={onSettingsOpen}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>

        <ThemeSwitcher />
      </div>
    </header>
  );
};

export default DashboardHeader;
