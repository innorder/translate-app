import React, { useState } from "react";
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
import { Plus, Trash2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LanguageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languages?: { code: string; name: string }[];
  onSave?: (languages: { code: string; name: string }[]) => void;
  defaultLanguage?: string;
}

const LanguageManager = ({
  open,
  onOpenChange,
  languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "ja", name: "Japanese" },
  ],
  onSave = () => {},
  defaultLanguage = "en",
}: LanguageManagerProps) => {
  const [currentLanguages, setCurrentLanguages] = useState([...languages]);
  const [newLanguageCode, setNewLanguageCode] = useState("");
  const [newLanguageName, setNewLanguageName] = useState("");
  const [error, setError] = useState("");

  const handleAddLanguage = () => {
    if (!newLanguageCode || !newLanguageName) {
      setError("Both language code and name are required");
      return;
    }

    if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(newLanguageCode)) {
      setError(
        "Language code must be in format 'xx' or 'xx-XX' (e.g., 'en' or 'en-US')",
      );
      return;
    }

    if (currentLanguages.some((lang) => lang.code === newLanguageCode)) {
      setError("This language code already exists");
      return;
    }

    setCurrentLanguages([
      ...currentLanguages,
      { code: newLanguageCode, name: newLanguageName },
    ]);
    setNewLanguageCode("");
    setNewLanguageName("");
    setError("");
  };

  const handleRemoveLanguage = (code: string) => {
    if (code === "en") {
      setError("Cannot remove the base language (English)");
      return;
    }

    setCurrentLanguages(currentLanguages.filter((lang) => lang.code !== code));
  };

  const handleSave = async () => {
    // Find newly added languages (not in the original languages array)
    const newLanguages = currentLanguages.filter(
      (lang) => !languages.some((origLang) => origLang.code === lang.code),
    );

    // If there are new languages and auto-translation is enabled, translate all keys
    if (newLanguages.length > 0 && typeof window !== "undefined") {
      const apiKey = localStorage.getItem("translationApiKey");
      const enableAutoTranslate =
        localStorage.getItem("enableAutoTranslate") !== "false";

      if (apiKey && enableAutoTranslate) {
        try {
          const { translateText } = await import("@/lib/translation-api");
          const newLanguageCodes = newLanguages.map((lang) => lang.code);

          // Dispatch an event that the main component can listen for
          const event = new CustomEvent("language-added", {
            detail: { newLanguages: newLanguageCodes },
          });
          document.dispatchEvent(event);
        } catch (error) {
          console.error("Error setting up auto-translation:", error);
        }
      }
    }

    onSave(currentLanguages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Manage Languages</DialogTitle>
          <DialogDescription>
            Add or remove languages for your translation project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Languages</h3>
            <div className="grid grid-cols-1 gap-2">
              {currentLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{lang.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {lang.code}
                    </Badge>
                    {lang.code === "en" && (
                      <Badge className="bg-primary">Base</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLanguage(lang.code)}
                    disabled={lang.code === "en"}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Add New Language</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="languageCode">Language Code</Label>
                <Input
                  id="languageCode"
                  placeholder="e.g., fr, zh-CN"
                  value={newLanguageCode}
                  onChange={(e) => setNewLanguageCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languageName">Language Name</Label>
                <Input
                  id="languageName"
                  placeholder="e.g., French, Chinese"
                  value={newLanguageName}
                  onChange={(e) => setNewLanguageName(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleAddLanguage}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>
        </div>

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

export default LanguageManager;
