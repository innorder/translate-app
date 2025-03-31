import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface NewKeyRowProps {
  keyId: string;
  languages: string[];
  onSave: (
    keyId: string,
    data: {
      key: string;
      description: string;
      translations: Record<string, string>;
    }
  ) => void;
  onCancel: () => void;
}

const NewKeyRow: React.FC<NewKeyRowProps> = ({
  keyId,
  languages,
  onSave,
  onCancel,
}) => {
  const [keyName, setKeyName] = useState("");
  const [description, setDescription] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>(
    languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {})
  );
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the key input when the component mounts
    if (keyInputRef.current) {
      keyInputRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    // Validate key name is not empty
    if (!keyName || keyName.trim() === "") {
      alert("Please enter a key name");
      return;
    }

    // Check if we have a base text (English)
    const hasBaseText = translations.en && translations.en.trim() !== "";
    if (!hasBaseText) {
      alert("Please enter base text (English) before saving");
      return;
    }

    console.log(
      "Checking base text for auto-translation:",
      translations.en,
      hasBaseText
    );

    let updatedTranslations = { ...translations };

    // Always auto-translate when base text is available
    if (hasBaseText) {
      console.log(
        "Auto-translation triggered for new key",
        keyId,
        "with base text:",
        translations.en
      );

      // Ensure the base text is not empty
      if (!translations.en || translations.en.trim() === "") {
        console.error("Cannot auto-translate: Base text is empty");
        return;
      }

      // Dispatch auto-translate event
      const event = new CustomEvent("auto-translate-request", {
        detail: {
          baseText: translations.en,
          keyId: keyId,
        },
      });
      console.log(
        "Dispatching auto-translate request with base text:",
        translations.en
      );
      document.dispatchEvent(event);

      // Wait for translations to complete (with timeout)
      try {
        const translationResult = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log("Auto-translation timed out for key", keyId);
            reject(new Error("Auto-translation timed out"));
          }, 10000); // Increased timeout to 10 seconds

          const handleTranslationComplete = (event: any) => {
            const { keyId: translatedKeyId, translations: newTranslations } =
              event.detail;
            console.log(
              "Received translation complete event for key",
              translatedKeyId,
              "current key:",
              keyId
            );

            if (translatedKeyId === keyId) {
              console.log(
                "Translation complete for key",
                keyId,
                "with translations:",
                newTranslations
              );
              clearTimeout(timeout);
              document.removeEventListener(
                "auto-translate-complete",
                handleTranslationComplete
              );
              resolve(newTranslations);
            }
          };

          document.addEventListener(
            "auto-translate-complete",
            handleTranslationComplete
          );
        });

        // Update translations with the result
        if (translationResult) {
          console.log(
            "Applying translations for key",
            keyId,
            translationResult
          );
          updatedTranslations = {
            ...updatedTranslations,
            ...translationResult,
          };
        }
      } catch (error) {
        console.error("Auto-translation error:", error);
        // Continue with saving even if auto-translation fails
      }
    }

    // Import the translation key service to save the key to the database
    try {
      const { saveTranslationKey } = await import(
        "@/lib/translation-key-service"
      );
      const { saveTranslation } = await import("@/lib/translation-client");

      // Generate a proper UUID if the keyId starts with "new-"
      const actualKeyId = keyId.startsWith("new-") ? uuidv4() : keyId;

      // Validate key name is not empty
      if (!keyName || keyName.trim() === "") {
        console.error("Cannot save key with empty name");
        return;
      }

      // Validate English translation is not empty
      if (!updatedTranslations.en || updatedTranslations.en.trim() === "") {
        console.error("Cannot save key with empty base text");
        return;
      }

      // Save the key to the database first
      const saveKeyResult = await saveTranslationKey({
        id: actualKeyId,
        key: keyName,
        description: description || "",
        status: "unconfirmed",
        created_by: "user",
      });

      console.log("Key saved to database:", saveKeyResult);

      // Then save each translation
      const translationPromises = Object.entries(updatedTranslations).map(
        ([lang, value]) => {
          return saveTranslation({
            key_id: actualKeyId,
            language_code: lang,
            value: value,
            created_by: "user_manual_edit",
          });
        }
      );

      await Promise.all(translationPromises);
      console.log("All translations saved to database");
    } catch (error) {
      console.error("Error saving key or translations to database:", error);
    }

    // Generate a proper UUID if the keyId starts with "new-"
    const actualKeyId = keyId.startsWith("new-") ? uuidv4() : keyId;

    // Save the key with current translations (possibly updated by auto-translation)
    onSave(actualKeyId, {
      key: keyName,
      description,
      translations: updatedTranslations,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "key") {
      setKeyName(value);
    } else if (field === "description") {
      setDescription(value);
    } else if (field.startsWith("lang_")) {
      const lang = field.replace("lang_", "");
      setTranslations((prev) => ({ ...prev, [lang]: value }));
    }
  };

  // Listen for get-base-text events to provide the current base text
  React.useEffect(() => {
    const handleGetBaseText = (event: any) => {
      const { keyId: requestedKeyId } = event.detail;
      if (requestedKeyId === keyId) {
        // Create a temporary element to pass the base text back
        const tempElement = document.createElement("div");
        tempElement.id = `temp-base-text-${keyId}`;
        tempElement.style.display = "none";
        tempElement.textContent = translations.en || "";
        document.body.appendChild(tempElement);
      }
    };

    document.addEventListener("get-base-text", handleGetBaseText);
    return () => {
      document.removeEventListener("get-base-text", handleGetBaseText);
    };
  }, [keyId, translations]);

  return (
    <tr className="border-b bg-accent/20" data-key-id={keyId}>
      <td className="p-2 w-10">
        <div className="flex items-center justify-center h-5 w-5">
          {/* Empty checkbox placeholder */}
          <div className="h-4 w-4"></div>
        </div>
      </td>
      <td className="p-2">
        <Input
          ref={keyInputRef}
          value={keyName}
          onChange={(e) => handleInputChange("key", e.target.value)}
          placeholder="Enter key name"
          className="h-8 text-sm w-full"
        />
      </td>
      <td className="p-2">
        <Textarea
          value={description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Add description"
          className="min-h-[40px] text-sm w-full"
        />
      </td>
      <td className="p-2">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          <span>New</span>
        </div>
      </td>
      <td className="p-2">
        <span className="text-xs text-muted-foreground">
          {new Date().toISOString().split("T")[0]}
        </span>
      </td>
      {languages.map((lang) => (
        <td key={lang} className="p-2">
          <Input
            value={translations[lang] || ""}
            onChange={(e) => handleInputChange(`lang_${lang}`, e.target.value)}
            placeholder={lang === "en" ? "Base text" : "Translation"}
            className="h-8 text-sm w-full"
            data-lang={lang}
          />
        </td>
      ))}
      <td className="p-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
            onClick={handleSave}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default NewKeyRow;
