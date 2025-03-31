import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Upload, Download, Plus, Globe, User } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import LogoutButton from "@/components/auth/LogoutButton";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface DashboardHeaderProps {
  onCreateNamespace?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onSettingsOpen?: () => void;
  onManageLanguages?: () => void;
  projectName?: string;
}

const DashboardHeader = ({
  onCreateNamespace = () => {},
  onImport = () => {},
  onExport = () => {},
  onSettingsOpen = () => {},
  onManageLanguages = () => {},
  projectName = "Translation Project",
}: DashboardHeaderProps) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Use the supabase client directly

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email);
      }
    };
    getUser();
  }, [supabase]);

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

        <Button variant="ghost" size="icon" onClick={onSettingsOpen}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>

        <ThemeSwitcher />

        {userEmail && (
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            {userEmail.split("@")[0]}
          </Button>
        )}

        <LogoutButton variant="ghost" size="sm" showIcon={true} />
      </div>
    </header>
  );
};

export default DashboardHeader;
