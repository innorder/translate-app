import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings?: {
    projectName: string;
    defaultLanguage: string;
    apiKey?: string;
    displayDensity: "comfortable" | "compact" | "spacious";
    showDescriptions: boolean;
    enableAutoTranslate: boolean;
    visibleLanguages: string[];
  };
  languages?: { code: string; name: string }[];
  onSave?: (settings: any) => void;
  onManageLanguages?: () => void;
}

const SettingsDialog = ({
  open,
  onOpenChange,
  settings = {
    projectName: "Translation Project",
    defaultLanguage: "en",
    apiKey: "",
    displayDensity: "comfortable",
    showDescriptions: true,
    enableAutoTranslate: true,
    visibleLanguages: ["en", "fr", "es", "de"],
  },
  languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
  ],
  onSave = () => {},
  onManageLanguages = () => {},
}: SettingsDialogProps) => {
  const [currentSettings, setCurrentSettings] = useState(settings);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("translationApiKey");
    if (savedApiKey) {
      setCurrentSettings((prev) => ({
        ...prev,
        apiKey: savedApiKey,
      }));
    }
  }, []);
  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (field: string, value: any) => {
    setCurrentSettings({ ...currentSettings, [field]: value });
  };

  const toggleLanguage = (code: string) => {
    const visibleLanguages = [...currentSettings.visibleLanguages];
    if (visibleLanguages.includes(code)) {
      // Don't allow removing the default language
      if (code === currentSettings.defaultLanguage) return;
      setCurrentSettings({
        ...currentSettings,
        visibleLanguages: visibleLanguages.filter((lang) => lang !== code),
      });
    } else {
      setCurrentSettings({
        ...currentSettings,
        visibleLanguages: [...visibleLanguages, code],
      });
    }
  };

  const handleSave = () => {
    // Save API key to localStorage if provided
    if (currentSettings.apiKey) {
      localStorage.setItem("translationApiKey", currentSettings.apiKey);
    }

    // Save auto-translate setting
    localStorage.setItem(
      "enableAutoTranslate",
      currentSettings.enableAutoTranslate.toString(),
    );

    onSave(currentSettings);
    onOpenChange(false);
  };

  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const testApiKey = async () => {
    if (!currentSettings.apiKey) {
      setApiTestResult({
        success: false,
        message: "Please enter an API key first",
      });
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const { testApiKey } = await import("@/lib/translation-api");
      const isValid = await testApiKey(currentSettings.apiKey);

      setApiTestResult({
        success: isValid,
        message: isValid
          ? "API key is valid!"
          : "Invalid API key. Please check and try again.",
      });
    } catch (error) {
      setApiTestResult({
        success: false,
        message:
          "Error testing API key. Please check your internet connection.",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure your translation project settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={currentSettings.projectName}
                onChange={(e) =>
                  handleInputChange("projectName", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Base Language</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>English (en)</span>
                <span className="text-xs text-muted-foreground ml-2">
                  Base language cannot be changed
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                English is the base language for all translations
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Visible Languages</Label>
                <Button
                  variant="link"
                  className="text-xs p-0 h-auto"
                  onClick={onManageLanguages}
                >
                  Manage Languages
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {languages.map((lang) => (
                  <div key={lang.code} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang.code}`}
                      checked={currentSettings.visibleLanguages.includes(
                        lang.code,
                      )}
                      onCheckedChange={() => toggleLanguage(lang.code)}
                      disabled={lang.code === "en"}
                    />
                    <label
                      htmlFor={`lang-${lang.code}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {lang.name}
                      {lang.code === "en" && " (Base)"}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayDensity">Display Density</Label>
              <Select
                value={currentSettings.displayDensity}
                onValueChange={(value) =>
                  handleInputChange("displayDensity", value)
                }
              >
                <SelectTrigger id="displayDensity">
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-y-0 py-2">
              <Label htmlFor="showDescriptions">Show Descriptions</Label>
              <Switch
                id="showDescriptions"
                checked={currentSettings.showDescriptions}
                onCheckedChange={(checked) =>
                  handleInputChange("showDescriptions", checked)
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Google Translate API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={currentSettings.apiKey}
                  onChange={(e) => handleInputChange("apiKey", e.target.value)}
                  placeholder="Enter your Google Translate API key"
                />
                <Button
                  variant="outline"
                  onClick={testApiKey}
                  disabled={isTestingApi || !currentSettings.apiKey}
                >
                  {isTestingApi ? "Testing..." : "Test Key"}
                </Button>
              </div>
              {apiTestResult && (
                <p
                  className={`text-sm ${apiTestResult.success ? "text-green-600" : "text-red-600"}`}
                >
                  {apiTestResult.message}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                API key for Google Translate API. You can get one from the
                Google Cloud Console.
              </p>
              <div className="mt-2 p-3 border rounded-md bg-muted/50">
                <h4 className="text-sm font-medium">
                  How to get a Google Translate API key:
                </h4>
                <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
                  <li>
                    Go to the{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </li>
                  <li>Create a new project or select an existing one</li>
                  <li>Enable the "Cloud Translation API"</li>
                  <li>Go to "Credentials" and create an API key</li>
                  <li>Copy the API key and paste it here</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-between space-y-0 py-2">
              <Label htmlFor="enableAutoTranslate">
                Enable Auto-Translation
              </Label>
              <Switch
                id="enableAutoTranslate"
                checked={currentSettings.enableAutoTranslate}
                onCheckedChange={(checked) =>
                  handleInputChange("enableAutoTranslate", checked)
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
