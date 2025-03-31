import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Globe, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LanguageSelector from "./LanguageSelector";
import {
  addLanguage,
  deleteLanguage,
  fetchLanguages,
} from "@/lib/language-service";

interface LanguageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languages?: { code: string; name: string; id?: string }[];
  onSave?: (languages: { code: string; name: string; id?: string }[]) => void;
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
  const [error, setError] = useState("");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch languages from database when dialog opens
  useEffect(() => {
    if (open) {
      loadLanguagesFromDatabase();
    }
  }, [open]);

  const loadLanguagesFromDatabase = async () => {
    setLoading(true);
    try {
      const { success, data, error } = await fetchLanguages();
      if (success && data && data.length > 0) {
        // Transform to the expected format
        const dbLanguages = data.map(
          (lang: { code: any; name: any; id: any }) => ({
            code: lang.code,
            name: lang.name,
            id: lang.id,
          })
        );
        setCurrentLanguages(dbLanguages);
      } else if (error) {
        console.error("Error loading languages:", error);
        setError("Failed to load languages from database");
      }
    } catch (err) {
      console.error("Error in loadLanguagesFromDatabase:", err);
      setError("An unexpected error occurred while loading languages");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLanguage = async (language: {
    code: string;
    name: string;
  }) => {
    if (currentLanguages.some((lang) => lang.code === language.code)) {
      setError("This language code already exists");
      return;
    }

    setSaving(true);
    try {
      // Add to database
      const {
        success,
        data,
        error: dbError,
      } = await addLanguage({
        code: language.code,
        name: language.name,
        is_base: false,
      });

      if (!success || dbError) {
        throw new Error(
          (dbError as unknown as any)?.message ||
            "Failed to add language to database"
        );
      }

      // Add new language to local state with ID from database
      const newLanguage =
        data && data[0]
          ? {
              code: data[0].code,
              name: data[0].name,
              id: data[0].id,
            }
          : language;

      setCurrentLanguages([...currentLanguages, newLanguage]);
      setError("");
      setShowLanguageSelector(false);
    } catch (err) {
      console.error("Error adding language:", err);
      setError(err instanceof Error ? err.message : "Failed to add language");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLanguage = async (code: string) => {
    if (code === "en") {
      setError("Cannot remove the base language (English)");
      return;
    }

    setSaving(true);
    try {
      // Find the language to remove
      const langToRemove = currentLanguages.find((lang) => lang.code === code);

      if (langToRemove?.id) {
        // Remove from database if we have an ID
        const { success, error: dbError } = await deleteLanguage(
          langToRemove.id
        );
        if (!success || dbError) {
          throw new Error(
            (dbError as unknown as any)?.message ||
              "Failed to remove language from database"
          );
        }
      }

      // Remove from local state
      setCurrentLanguages(
        currentLanguages.filter((lang) => lang.code !== code)
      );
      setError("");
    } catch (err) {
      console.error("Error removing language:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove language"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    // Find newly added languages (not in the original languages array)
    const newLanguages = currentLanguages.filter(
      (lang) => !languages.some((origLang) => origLang.code === lang.code)
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
            {loading ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Loading languages...</span>
              </div>
            ) : (
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
                      disabled={lang.code === "en" || saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Add New Language</h3>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {showLanguageSelector ? (
              <LanguageSelector
                onSelectLanguage={handleAddLanguage}
                excludedCodes={currentLanguages.map((lang) => lang.code)}
              />
            ) : (
              <Button
                onClick={() => setShowLanguageSelector(true)}
                className="w-full"
                variant="outline"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Language
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageManager;
