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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Wand2 } from "lucide-react";

interface TranslationKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  initialData?: {
    key: string;
    description?: string;
    translations: Record<string, string>;
  };
  languages?: { code: string; name: string }[];
  onSave?: (data: any) => void;
  onAutoTranslate?: (sourceLanguage: string, targetLanguages: string[]) => void;
}

const TranslationKeyDialog = ({
  open,
  onOpenChange,
  editMode = false,
  initialData = {
    key: "",
    description: "",
    translations: { en: "", fr: "", es: "", de: "" },
  },
  languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
  ],
  onSave = () => {},
  onAutoTranslate = () => {},
}: TranslationKeyDialogProps) => {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState(
    languages.find((l) => l.code !== "en")?.code || "fr",
  );

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleTranslationChange = async (lang: string, value: string) => {
    setData({
      ...data,
      translations: { ...data.translations, [lang]: value },
    });

    // Auto-translate when base text (English) changes
    if (lang === "en" && value.trim() !== "") {
      // Only auto-translate if there's actual content
      const targetLanguages = languages
        .filter((lang) => lang.code !== "en")
        .map((lang) => lang.code);

      // Slight delay to avoid translating on every keystroke
      setTimeout(() => {
        onAutoTranslate("en", targetLanguages);
      }, 1000);
    }
  };

  const handleSave = async () => {
    // If we have base text but missing translations, auto-translate before saving
    if (data.translations["en"] && data.translations["en"].trim() !== "") {
      const targetLanguages = languages
        .filter((lang) => lang.code !== "en")
        .map((lang) => lang.code);

      // Check if any translations are missing
      const needsTranslation = targetLanguages.some(
        (lang) =>
          !data.translations[lang] || data.translations[lang].trim() === "",
      );

      if (needsTranslation && !editMode) {
        setIsTranslating(true);
        await onAutoTranslate("en", targetLanguages);
        // Wait a moment for translations to be applied
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the latest translations from the state after auto-translation
        const updatedData = { ...data };
        setIsTranslating(false);
        onSave(updatedData);
        onOpenChange(false);
        return;
      }
    }

    onSave(data);
    onOpenChange(false);
  };

  const handleAutoTranslate = () => {
    const targetLanguages = languages
      .filter((lang) => lang.code !== "en")
      .map((lang) => lang.code);
    onAutoTranslate("en", targetLanguages);
  };

  const [isTranslating, setIsTranslating] = useState(false);

  // Listen for auto-translate events
  React.useEffect(() => {
    const handleAutoTranslateComplete = (event: any) => {
      const { translations } = event.detail;
      const updatedTranslations = { ...data.translations };

      // Merge the new translations
      Object.keys(translations).forEach((lang) => {
        updatedTranslations[lang] = translations[lang];
      });

      // Update the data state with new translations
      const updatedData = {
        ...data,
        translations: updatedTranslations,
      };

      setData(updatedData);
      console.log("Updated translations in dialog:", updatedTranslations);
      setIsTranslating(false);
    };

    document.addEventListener(
      "auto-translate-complete",
      handleAutoTranslateComplete,
    );

    return () => {
      document.removeEventListener(
        "auto-translate-complete",
        handleAutoTranslateComplete,
      );
    };
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "Edit Translation Key" : "Add New Translation Key"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the key details and translations below."
              : "Fill in the key details and translations below."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key Name</Label>
              <Input
                id="key"
                value={data.key}
                onChange={(e) => handleInputChange("key", e.target.value)}
                placeholder="e.g., welcome.message"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={data.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="e.g., Welcome message on homepage"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Base Text (
                {languages.find((l) => l.code === "en")?.name || "English"})
              </Label>
              <Textarea
                id="en-base-text"
                placeholder="Enter the base text here..."
                className="min-h-[100px]"
                value={data.translations["en"] || ""}
                onChange={(e) => handleTranslationChange("en", e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Translations</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !data.translations["en"]}
              >
                <Wand2
                  className={`h-4 w-4 mr-1 ${isTranslating ? "animate-spin" : ""}`}
                />
                {isTranslating ? "Translating..." : "Auto-Translate All"}
              </Button>
            </div>

            <Tabs
              defaultValue={
                languages.find((l) => l.code !== "en")?.code || "fr"
              }
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                {languages
                  .filter((lang) => lang.code !== "en")
                  .map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {lang.name}
                      </div>
                    </TabsTrigger>
                  ))}
              </TabsList>

              {languages
                .filter((lang) => lang.code !== "en")
                .map((lang) => (
                  <TabsContent key={lang.code} value={lang.code}>
                    <Textarea
                      placeholder={`Enter ${lang.name} translation here...`}
                      className="min-h-[100px]"
                      value={data.translations[lang.code] || ""}
                      onChange={(e) =>
                        handleTranslationChange(lang.code, e.target.value)
                      }
                    />
                  </TabsContent>
                ))}
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isTranslating}>
            {isTranslating ? "Translating..." : editMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranslationKeyDialog;
