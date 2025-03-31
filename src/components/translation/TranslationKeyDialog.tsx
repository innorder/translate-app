import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  onAutoTranslate?: (
    sourceLanguage: string,
    targetLanguages: string[],
    persistToDB?: boolean
  ) => void;
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
    languages.find((l) => l.code !== "en")?.code || "fr"
  );
  const [showTranslateAlert, setShowTranslateAlert] = useState(false);
  const [pendingTargetLanguages, setPendingTargetLanguages] = useState<
    string[]
  >([]);

  const handleInputChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
  };

  const handleTranslationChange = async (lang: string, value: string) => {
    setData({
      ...data,
      translations: { ...data.translations, [lang]: value },
    });

    // When base text (English) changes and there's content
    if (
      lang === "en" &&
      value.trim() !== "" &&
      data.translations["en"] !== value
    ) {
      // Only prompt if there are existing translations that would be overwritten
      const hasExistingTranslations = languages
        .filter((lang) => lang.code !== "en")
        .some(
          (lang) =>
            data.translations[lang.code] &&
            data.translations[lang.code].trim() !== ""
        );

      if (hasExistingTranslations) {
        // Ask user if they want to auto-translate
        const targetLanguages = languages
          .filter((lang) => lang.code !== "en")
          .map((lang) => lang.code);

        // Slight delay to avoid prompting on every keystroke
        setTimeout(() => {
          setPendingTargetLanguages(targetLanguages);
          setShowTranslateAlert(true);
        }, 1000);
      }
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
          !data.translations[lang] || data.translations[lang].trim() === ""
      );

      if (needsTranslation) {
        setIsTranslating(true);
        console.log("Auto-translating before save", { targetLanguages });

        // Directly call auto-translate and wait for it to complete
        onAutoTranslate("en", targetLanguages, true); // Set persistToDB to true

        // Create a promise that will resolve when translations are complete
        const translationPromise = new Promise((resolve) => {
          const checkTranslations = () => {
            // Check if all target languages have translations
            const allTranslated = targetLanguages.every(
              (lang) =>
                data.translations[lang] && data.translations[lang].trim() !== ""
            );

            if (allTranslated) {
              resolve(true);
            } else {
              // Set up a listener for the auto-translate-complete event
              const handleComplete = () => {
                document.removeEventListener(
                  "auto-translate-complete",
                  handleComplete
                );
                resolve(true);
              };

              document.addEventListener(
                "auto-translate-complete",
                handleComplete,
                { once: true }
              );

              // Also set a timeout as a fallback
              setTimeout(resolve, 5000, false);
            }
          };

          // Start checking
          checkTranslations();
        });

        // Wait for translations to be applied
        const translationSuccess = await translationPromise;
        console.log("Translation completed with success:", translationSuccess);

        // Create a copy of the current data to ensure we have the latest state
        const updatedData = { ...data };

        // Log the final state before saving
        console.log(
          "Final translations before save:",
          updatedData.translations
        );

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
    setIsTranslating(true);
    const targetLanguages = languages
      .filter((lang) => lang.code !== "en")
      .map((lang) => lang.code);
    console.log(
      "Manual auto-translate triggered for languages:",
      targetLanguages
    );

    // Ensure we have base text before translating
    if (!data.translations["en"] || data.translations["en"].trim() === "") {
      console.error("Cannot translate without base text");
      setIsTranslating(false);
      return;
    }

    onAutoTranslate("en", targetLanguages, true); // Set persistToDB to true
  };

  const [isTranslating, setIsTranslating] = useState(false);

  // Listen for auto-translate events
  React.useEffect(() => {
    const handleAutoTranslateComplete = (event: any) => {
      const { translations } = event.detail;
      console.log("Auto-translate event received:", translations);

      if (!translations || Object.keys(translations).length === 0) {
        console.error("No translations received in event");
        setIsTranslating(false);
        return;
      }

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

      console.log("Setting updated translations:", updatedTranslations);
      setData(updatedData);

      // Dispatch a custom event to signal that translations are complete
      const completeEvent = new CustomEvent("auto-translate-complete", {
        detail: { success: true },
      });
      document.dispatchEvent(completeEvent);

      setIsTranslating(false);
    };

    document.addEventListener(
      "auto-translate-complete",
      handleAutoTranslateComplete
    );

    return () => {
      document.removeEventListener(
        "auto-translate-complete",
        handleAutoTranslateComplete
      );
    };
  }, [data]);

  // Debug auto-translation
  React.useEffect(() => {
    console.log("Current translations state:", data.translations);
  }, [data.translations]);

  const handleConfirmAutoTranslate = () => {
    if (pendingTargetLanguages.length > 0) {
      onAutoTranslate("en", pendingTargetLanguages, true); // Set persistToDB to true
    }
    setShowTranslateAlert(false);
  };

  const handleCancelAutoTranslate = () => {
    setShowTranslateAlert(false);
  };

  return (
    <>
      <AlertDialog
        open={showTranslateAlert}
        onOpenChange={setShowTranslateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Translations</AlertDialogTitle>
            <AlertDialogDescription>
              You've changed the base text. Would you like to auto-update all
              translations?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAutoTranslate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAutoTranslate}>
              Update All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  onChange={(e) =>
                    handleTranslationChange("en", e.target.value)
                  }
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
              {isTranslating
                ? "Translating..."
                : editMode
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TranslationKeyDialog;
