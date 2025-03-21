"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import DashboardHeader from "@/components/translation/DashboardHeader";
import NamespaceSelector from "@/components/translation/NamespaceSelector";
import TranslationTable from "@/components/translation/TranslationTable";
import ImportExportMenu from "@/components/translation/ImportExportMenu";
import TableToolbar from "@/components/translation/TableToolbar";
import SettingsDialog from "@/components/translation/SettingsDialog";
import LanguageManager from "@/components/translation/LanguageManager";
import ApiKeyGenerator from "@/components/translation/ApiKeyGenerator";
import ApiKeyManager from "@/components/translation/ApiKeyManager";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoryDialog from "@/components/translation/HistoryDialog";
import { supabase } from "@/lib/supabase";
import { recordHistory } from "@/lib/history-service";

interface Namespace {
  id: string;
  name: string;
}

interface TranslationKey {
  id: string;
  key: string;
  description?: string;
  lastUpdated: string;
  status: "confirmed" | "unconfirmed";
  translations: {
    [language: string]: string;
  };
}

export default function TranslationDashboard() {
  // State for dialogs
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languageManagerOpen, setLanguageManagerOpen] = useState(false);
  const [apiKeyGeneratorOpen, setApiKeyGeneratorOpen] = useState(false);
  const [apiKeyManagerOpen, setApiKeyManagerOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State for namespace selection
  const [selectedNamespace, setSelectedNamespace] = useState<Namespace>({
    id: "default",
    name: "Default Namespace",
  });

  // State for selected translation keys
  const [selectedKeys, setSelectedKeys] = useState<TranslationKey[]>([]);

  // State for tracking currently editing key
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // State for all translation keys
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([
    {
      id: "1",
      key: "welcome.message",
      description: "Welcome message on homepage",
      lastUpdated: "2023-10-15",
      status: "confirmed",
      translations: {
        en: "Welcome to our application",
        fr: "Bienvenue dans notre application",
        es: "Bienvenido a nuestra aplicación",
        de: "Willkommen in unserer Anwendung",
      },
      history: [
        { action: "Created", user: "John Doe", timestamp: "2023-10-01" },
        {
          action: "Updated French translation",
          user: "Marie Dupont",
          timestamp: "2023-10-10",
        },
        {
          action: "Updated Spanish translation",
          user: "Carlos Rodriguez",
          timestamp: "2023-10-15",
        },
      ],
    },
    {
      id: "2",
      key: "button.submit",
      description: "Submit button text",
      lastUpdated: "2023-10-10",
      status: "confirmed",
      translations: {
        en: "Submit",
        fr: "Soumettre",
        es: "Enviar",
        de: "Einreichen",
      },
      history: [
        { action: "Created", user: "John Doe", timestamp: "2023-09-25" },
        {
          action: "Updated all translations",
          user: "John Doe",
          timestamp: "2023-10-10",
        },
      ],
    },
    {
      id: "3",
      key: "error.required",
      description: "Error message for required fields",
      lastUpdated: "2023-09-28",
      status: "unconfirmed",
      translations: {
        en: "This field is required",
        fr: "Ce champ est obligatoire",
        es: "",
        de: "Dieses Feld ist erforderlich",
      },
      history: [
        { action: "Created", user: "Sarah Williams", timestamp: "2023-09-28" },
      ],
    },
    {
      id: "4",
      key: "nav.home",
      description: "Navigation label for home",
      lastUpdated: "2023-09-20",
      status: "unconfirmed",
      translations: {
        en: "Home",
        fr: "Accueil",
        es: "Inicio",
        de: "Startseite",
      },
      history: [
        { action: "Created", user: "Alex Johnson", timestamp: "2023-09-15" },
        {
          action: "Marked as outdated",
          user: "John Doe",
          timestamp: "2023-09-20",
        },
      ],
    },
    {
      id: "5",
      key: "nav.settings",
      description: "Navigation label for settings",
      lastUpdated: "2023-09-15",
      status: "confirmed",
      translations: {
        en: "Settings",
        fr: "Paramètres",
        es: "Configuración",
        de: "Einstellungen",
      },
      history: [
        { action: "Created", user: "Alex Johnson", timestamp: "2023-09-15" },
      ],
    },
  ]);

  // State for languages
  const [languages, setLanguages] = useState<{ code: string; name: string }[]>([
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
  ]);

  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  // State for filter
  const [currentFilter, setCurrentFilter] = useState("all");

  // Handle namespace selection
  const handleNamespaceSelect = (namespace: Namespace) => {
    setSelectedNamespace(namespace);
  };

  // Handle namespace creation
  const handleCreateNamespace = (name: string) => {
    console.log("Create namespace:", name);
    // In a real implementation, we would create a new namespace
  };

  // Handle namespace deletion
  const handleDeleteNamespace = (id: string) => {
    console.log("Delete namespace:", id);
    // In a real implementation, we would delete the namespace
  };

  // Handle import/export actions
  const handleImport = () => {
    setImportExportOpen(true);
  };

  const handleExport = () => {
    setImportExportOpen(true);
  };

  const handleImportComplete = (importedData: any[]) => {
    // Merge imported data with existing data
    // Check for duplicates by key
    const existingKeys = new Set(translationKeys.map((key) => key.key));

    const newKeys = importedData.filter((item) => !existingKeys.has(item.key));
    const updatedKeys = importedData.filter((item) =>
      existingKeys.has(item.key),
    );

    // Update existing keys
    const updatedTranslationKeys = translationKeys.map((key) => {
      const match = updatedKeys.find((item) => item.key === key.key);
      if (match) {
        // Merge translations
        const mergedTranslations = { ...key.translations };

        // Check if this is from a single-language import
        if (match.singleLanguageImport) {
          // Only update the specific language from the import
          const lang = match.singleLanguageImport;
          if (match.translations[lang]) {
            mergedTranslations[lang] = match.translations[lang];

            // If this is an English import, make sure the base text is set
            if (lang === "en") {
              mergedTranslations.en = match.translations.en;
            }
          }
        } else {
          // Standard multi-language import - update all languages
          Object.keys(match.translations).forEach((lang) => {
            if (match.translations[lang]) {
              mergedTranslations[lang] = match.translations[lang];
            }
          });
        }

        return {
          ...key,
          translations: mergedTranslations,
          lastUpdated: new Date().toISOString().split("T")[0],
          // Imported keys are always unconfirmed until explicitly confirmed
          status: "unconfirmed",
        };
      }
      return key;
    });

    // Add new keys
    setTranslationKeys([...updatedTranslationKeys, ...newKeys]);

    // Show success message
    alert(
      `Import complete: ${newKeys.length} new keys added, ${updatedKeys.length} keys updated`,
    );
  };

  // Handle settings
  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  // Handle language management
  const handleManageLanguages = () => {
    setLanguageManagerOpen(true);
  };

  // Listen for language-added event
  React.useEffect(() => {
    const handleLanguageAdded = async (event: any) => {
      const { newLanguages } = event.detail;

      if (newLanguages && newLanguages.length > 0) {
        // Auto-translate all keys for the new languages
        const apiKey = localStorage.getItem("translationApiKey");

        if (!apiKey) {
          alert(
            "Please add a Google Translate API key in Settings > API to auto-translate new languages",
          );
          return;
        }

        // Show loading message
        alert(
          `Auto-translating content for ${newLanguages.length} new language(s). This may take a moment...`,
        );

        try {
          const { translateText } = await import("@/lib/translation-api");
          const updatedKeys = [...translationKeys];

          // Process each key one by one
          for (const key of updatedKeys) {
            if (!key.translations.en) continue; // Skip keys without English text

            const result = await translateText({
              sourceLanguage: "en",
              targetLanguages: newLanguages,
              text: key.translations.en,
              apiKey,
            });

            if (result.success) {
              // Update translations for this key
              key.translations = {
                ...key.translations,
                ...result.translations,
              };

              // Auto-translated keys remain unconfirmed
              key.status = "unconfirmed";
            }
          }

          // Update all keys at once
          setTranslationKeys(updatedKeys);
          alert("Auto-translation complete!");
        } catch (error) {
          console.error("Auto-translation error:", error);
          alert(
            "Auto-translation failed. Please check your API key and try again.",
          );
        }
      }
    };

    document.addEventListener("language-added", handleLanguageAdded);
    return () =>
      document.removeEventListener("language-added", handleLanguageAdded);
  }, [translationKeys, languages]);

  // Handle API integration
  const handleApiIntegration = () => {
    // In production mode, use the API Key Manager
    // For demo/development, use the API Key Generator
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      setApiKeyManagerOpen(true);
    } else {
      setApiKeyGeneratorOpen(true);
    }
  };

  const handleSaveLanguages = (
    updatedLanguages: { code: string; name: string }[],
  ) => {
    setLanguages(updatedLanguages);
    console.log("Languages updated:", updatedLanguages);
  };

  // Handle translation key actions
  const handleAddKey = () => {
    // Dispatch an event to create a new key row
    document.dispatchEvent(new CustomEvent("add-new-key"));
  };

  const handleEditKey = (key: TranslationKey, isInlineEdit = false) => {
    // If it's already an inline edit, we don't need to do anything
    if (isInlineEdit) return;

    // Otherwise, we'll trigger inline editing for the key name
    const event = new CustomEvent("start-inline-edit", {
      detail: { keyId: key.id, field: "key" },
    });
    document.dispatchEvent(event);
  };

  const handleDeleteKey = async (key: TranslationKey) => {
    console.log("Delete key:", key);
    // Add to deletion history before removing
    const currentDate = new Date().toISOString().split("T")[0];

    // Record deletion in database history
    try {
      await recordHistory({
        key_id: key.id,
        action: "Deleted key",
        field: "key",
        old_value: key.key,
      });

      // Log the deletion
      console.log(`Key "${key.key}" deleted on ${currentDate}`);

      // Remove from state
      setTranslationKeys((prevKeys) => prevKeys.filter((k) => k.id !== key.id));
    } catch (error) {
      console.error("Failed to record deletion history:", error);
    }
  };

  // Listen for view-key-history events
  React.useEffect(() => {
    const handleViewKeyHistory = (event: any) => {
      if (event.detail) {
        const { keyId, keyName } = event.detail;
        setSelectedHistoryKey({ id: keyId, name: keyName });
        setHistoryDialogOpen(true);
      }
    };

    document.addEventListener("view-key-history", handleViewKeyHistory);
    return () => {
      document.removeEventListener("view-key-history", handleViewKeyHistory);
    };
  }, []);

  // Listen for confirm-translations events
  React.useEffect(() => {
    const handleConfirmTranslations = (event: any) => {
      const { keyId } = event.detail;
      if (keyId) {
        setTranslationKeys((prevKeys) =>
          prevKeys.map((key) => {
            if (key.id === keyId) {
              // Create an updated key with confirmed status
              const updatedKey = {
                ...key,
                status: "confirmed",
                lastUpdated: new Date().toISOString().split("T")[0],
              };

              // Record history in database
              recordHistory({
                key_id: keyId,
                action: "Confirmed translations",
                field: "status",
                old_value: "unconfirmed",
                new_value: "confirmed",
              }).catch((error) => {
                console.error("Failed to record confirmation history:", error);
              });

              return updatedKey;
            }
            return key;
          }),
        );
      }
    };

    document.addEventListener(
      "confirm-translations",
      handleConfirmTranslations,
    );

    return () => {
      document.removeEventListener(
        "confirm-translations",
        handleConfirmTranslations,
      );
    };
  }, []);

  // Listen for update-key, delete-key, and add-key events at the page level
  React.useEffect(() => {
    const handleUpdateKeyEvent = (event: any) => {
      if (event.detail) {
        const { keyId, field, value } = event.detail;
        handleUpdateKey(keyId, field, value);
      } else {
        console.error("Received update-key event with undefined detail");
      }
    };

    const handleDeleteKeyEvent = (event: any) => {
      if (event.detail) {
        const { keyId } = event.detail;
        setTranslationKeys((prevKeys) =>
          prevKeys.filter((k) => k.id !== keyId),
        );
      }
    };

    const handleAddKeyEvent = (event: any) => {
      if (event.detail && event.detail.key) {
        let newKey = event.detail.key;
        const keyId = newKey.id;

        // Check if we have pending translations for this key
        const pendingTranslationsListener = (e: any) => {
          if (e.detail.keyId === keyId && e.detail.translations) {
            console.log(
              "Found pending translations for new key:",
              keyId,
              e.detail.translations,
            );
            // Update the new key with the translations
            newKey = {
              ...newKey,
              translations: {
                ...newKey.translations,
                ...e.detail.translations,
              },
              // New keys with auto-translations are unconfirmed
              status: "unconfirmed",
            };

            // Remove this listener as we've processed the translations
            document.removeEventListener(
              "auto-translate-complete",
              pendingTranslationsListener,
            );
          }
        };

        // Listen for one auto-translate-complete event for this key
        document.addEventListener(
          "auto-translate-complete",
          pendingTranslationsListener,
          { once: true },
        );

        // Add the new key to the state
        setTranslationKeys((prevKeys) => [newKey, ...prevKeys]);
      }
    };

    document.addEventListener("update-key", handleUpdateKeyEvent);
    document.addEventListener("delete-key", handleDeleteKeyEvent);
    document.addEventListener("add-key", handleAddKeyEvent);

    return () => {
      document.removeEventListener("update-key", handleUpdateKeyEvent);
      document.removeEventListener("delete-key", handleDeleteKeyEvent);
      document.removeEventListener("add-key", handleAddKeyEvent);
    };
  }, []);

  // Listen for auto-translate events at the page level
  React.useEffect(() => {
    const handleAutoTranslateComplete = (event: any) => {
      const { translations, keyId } = event.detail;
      console.log("Auto-translate complete event received:", {
        translations,
        keyId,
      });

      if (keyId) {
        // For new keys that aren't in the state yet, store translations temporarily
        if (keyId.startsWith("new-")) {
          console.log("Handling translations for new key:", keyId);
          // We'll handle this in the add-key event listener
          // Just dispatch the event with the translations
          const completeEvent = new CustomEvent("auto-translate-complete", {
            detail: { translations, keyId },
          });
          document.dispatchEvent(completeEvent);
          return;
        }

        // Update specific key's translations
        setTranslationKeys((prevKeys) =>
          prevKeys.map((key) => {
            if (key.id === keyId) {
              return {
                ...key,
                translations: { ...key.translations, ...translations },
                lastUpdated: new Date().toISOString().split("T")[0],
                // Auto-translated keys remain unconfirmed
                status: "unconfirmed",
              };
            }
            return key;
          }),
        );
      }
    };

    const handleAutoTranslateKey = (event: any) => {
      const { keyId, sourceLanguage, targetLanguages } = event.detail;
      handleAutoTranslate(sourceLanguage, targetLanguages, keyId);
    };

    const handleAutoTranslateRequest = async (event: any) => {
      const { baseText, keyId } = event.detail;
      console.log(
        "Auto-translate request received for key",
        keyId,
        "with base text:",
        baseText,
      );

      if (baseText) {
        const targetLanguages = languages
          .filter((lang) => lang.code !== "en")
          .map((lang) => lang.code);

        console.log("Target languages for auto-translation:", targetLanguages);

        // Pass the keyId to the auto-translate function
        const keyToTranslate = keyId || (editingKey ? editingKey : null);
        await handleAutoTranslate("en", targetLanguages, keyToTranslate);
      } else {
        console.warn(
          "Auto-translate request received but base text is empty for key",
          keyId,
        );
      }
    };

    document.addEventListener(
      "auto-translate-complete",
      handleAutoTranslateComplete,
    );

    document.addEventListener("auto-translate-key", handleAutoTranslateKey);

    document.addEventListener(
      "auto-translate-request",
      handleAutoTranslateRequest,
    );

    return () => {
      document.removeEventListener(
        "auto-translate-complete",
        handleAutoTranslateComplete,
      );
      document.removeEventListener(
        "auto-translate-key",
        handleAutoTranslateKey,
      );
      document.removeEventListener(
        "auto-translate-request",
        handleAutoTranslateRequest,
      );
    };
  }, [languages, editingKey]);

  const handleDeleteSelected = () => {
    console.log("Delete selected keys:", selectedKeys);
    const selectedIds = selectedKeys.map((key) => key.id);
    setTranslationKeys((prevKeys) =>
      prevKeys.filter((key) => !selectedIds.includes(key.id)),
    );
    setSelectedKeys([]);
  };

  const handleSelectKeys = (keys: TranslationKey[]) => {
    setSelectedKeys(keys);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real implementation, we would filter the keys based on the query
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    // Apply the filter to the translation keys
  };

  const handleUpdateKey = async (keyId: string, field: string, value: any) => {
    console.log(`Update key ${keyId}, field ${field}, value:`, value);
    const currentDate = new Date().toISOString().split("T")[0];

    // Get the key before updating
    const keyToUpdate = translationKeys.find((k) => k.id === keyId);
    if (!keyToUpdate) return;

    // Determine old value based on field
    let oldValue = "";
    if (field === "key") {
      oldValue = keyToUpdate.key;
    } else if (field === "description") {
      oldValue = keyToUpdate.description || "";
    } else if (field.startsWith("translation_")) {
      const lang = field.replace("translation_", "");
      oldValue = keyToUpdate.translations[lang] || "";
    }

    // Create action description
    const actionDescription =
      field === "key"
        ? "Updated key name"
        : field === "description"
          ? "Updated description"
          : `Updated ${field.replace("translation_", "translation for ")}`;

    setTranslationKeys((prevKeys) => {
      const updatedKeys = prevKeys.map((key) => {
        if (key.id !== keyId) return key;

        // Create updated key based on the field being edited
        let updatedKey = { ...key, lastUpdated: currentDate };

        if (field === "key") {
          updatedKey.key = value;
        } else if (field === "description") {
          updatedKey.description = value;
        } else if (field.startsWith("translation_")) {
          const lang = field.replace("translation_", "");
          updatedKey.translations = { ...key.translations, [lang]: value };

          // Any update to translations sets status to unconfirmed
          updatedKey.status = "unconfirmed";
        }

        // Add to local history
        updatedKey.history = [
          {
            action: actionDescription,
            user: "You", // Will be replaced with actual user in DB
            timestamp: currentDate,
            field: field,
            old_value: oldValue,
            new_value: value,
          },
          ...(key.history || []),
        ];

        return updatedKey;
      });

      // Force a re-render by creating a new array
      return [...updatedKeys];
    });

    // Record history in database
    try {
      await recordHistory({
        key_id: keyId,
        action: actionDescription,
        field: field,
        old_value: oldValue,
        new_value: value,
      });
    } catch (error) {
      console.error("Failed to record history:", error);
    }
  };

  const handleAutoTranslate = async (
    sourceLanguage: string,
    targetLanguages: string[],
    keyId?: string,
  ) => {
    console.log(
      "Auto translate from",
      sourceLanguage,
      "to",
      targetLanguages,
      "for key",
      keyId,
    );

    // Get the API key from settings
    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("translationApiKey")
        : null;
    if (!apiKey) {
      console.warn("No translation API key found");
      alert("Please add a Google Translate API key in Settings > API first");
      setSettingsOpen(true);
      return;
    }

    try {
      // Import the translation API dynamically
      const { translateText } = await import("@/lib/translation-api");

      // Get the source text from the key's English translation
      let sourceText = "";
      let keyToTranslate = null;

      if (keyId) {
        // Check if it's a new key being created (starts with "new-")
        if (keyId.startsWith("new-")) {
          // For new keys, try to get the text from the DOM
          const editingElement = document.querySelector(
            `[data-key-id="${keyId}"] input[data-lang="en"], [data-key-id="${keyId}"] textarea[data-lang="en"]`,
          );
          if (
            editingElement instanceof HTMLInputElement ||
            editingElement instanceof HTMLTextAreaElement
          ) {
            sourceText = editingElement.value;
            console.log("Got source text from new key input:", sourceText);
          } else {
            console.warn("Could not find input element for new key", keyId);
            // Try to find any input with English placeholder
            const anyEnglishInput = document.querySelector(
              `[data-key-id="${keyId}"] input[placeholder="Base text"]`,
            );
            if (anyEnglishInput instanceof HTMLInputElement) {
              sourceText = anyEnglishInput.value;
              console.log(
                "Got source text from base text placeholder input:",
                sourceText,
              );
            }
          }
        } else {
          // For existing keys
          keyToTranslate = translationKeys.find((k) => k.id === keyId);
          if (keyToTranslate) {
            sourceText = keyToTranslate.translations["en"];
            console.log(
              "Found key to translate:",
              keyToTranslate.key,
              "with source text:",
              sourceText,
            );
          } else {
            console.log("Key not found with ID:", keyId);
          }
        }
      }

      // If we're editing a cell, get the latest value from the DOM
      if ((!sourceText || sourceText.trim() === "") && keyId) {
        const editingElement = document.querySelector(
          `[data-key-id="${keyId}"] textarea, [data-key-id="${keyId}"] input[data-lang="en"]`,
        );
        if (
          editingElement instanceof HTMLTextAreaElement ||
          editingElement instanceof HTMLInputElement
        ) {
          sourceText = editingElement.value;
          console.log("Got source text from input/textarea:", sourceText);
        }
      }

      // If we still don't have source text, check if it was passed in the event
      if (!sourceText || sourceText.trim() === "") {
        const event = new CustomEvent("get-base-text", {
          detail: { keyId },
        });
        document.dispatchEvent(event);

        // Wait a short time to see if any listeners respond with the base text
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if we got a response with the base text
        const baseTextResponse = document.querySelector(
          `#temp-base-text-${keyId}`,
        );
        if (baseTextResponse) {
          sourceText = baseTextResponse.textContent || "";
          baseTextResponse.remove();
          console.log("Got source text from event response:", sourceText);
        }
      }

      // One last attempt - check if this is a newly imported key
      if ((!sourceText || sourceText.trim() === "") && keyId) {
        const key = translationKeys.find((k) => k.id === keyId);
        if (key && key.translations) {
          // First try the standard English key
          if (key.translations.en && key.translations.en.trim() !== "") {
            sourceText = key.translations.en;
            console.log("Found base text from translations.en:", sourceText);
          } else {
            // Try to find any English-like key that has content
            const englishKey = Object.keys(key.translations).find(
              (lang) =>
                (lang.toLowerCase().includes("en") ||
                  lang === "base" ||
                  lang === "default") &&
                key.translations[lang] &&
                key.translations[lang].trim() !== "",
            );

            if (englishKey) {
              sourceText = key.translations[englishKey];
              console.log(
                `Found base text from translations.${englishKey}:`,
                sourceText,
              );

              // Also update the en key for future use
              key.translations.en = sourceText;
            }
          }
        }
      }

      if (!sourceText || sourceText.trim() === "") {
        console.warn("Base text is empty for key", keyId);

        // Check if we're working with an imported key that might have non-English content
        const keyToCheck = translationKeys.find((k) => k.id === keyId);
        if (keyToCheck && Object.keys(keyToCheck.translations).length > 0) {
          // Try to find any non-empty translation to use as base text
          for (const lang in keyToCheck.translations) {
            const value = keyToCheck.translations[lang];
            if (value !== null && value !== undefined && value.trim() !== "") {
              // Convert any non-string values to strings
              sourceText =
                typeof value === "string" ? value : JSON.stringify(value);
              console.log(
                `Using ${lang} translation as base text for auto-translation: ${sourceText}`,
              );

              // Update the English translation with this text
              const updateEvent = new CustomEvent("update-key", {
                detail: {
                  keyId: keyId,
                  field: "translation_en",
                  value: sourceText,
                },
              });
              document.dispatchEvent(updateEvent);
              break;
            }
          }
        }

        if (!sourceText || sourceText.trim() === "") {
          alert(`Base text is empty. Please add text in English first.`);
          return;
        }
      }

      // Call the translation API
      console.log("Calling translation API with source text:", sourceText);
      const result = await translateText({
        sourceLanguage: "en",
        targetLanguages,
        text: sourceText,
        apiKey,
      });

      if (result.success) {
        console.log(
          "Translation successful for key",
          keyId,
          ":",
          result.translations,
        );
        // Dispatch event with translations and key ID
        const event = new CustomEvent("auto-translate-complete", {
          detail: {
            translations: result.translations,
            keyId: keyId,
          },
        });
        document.dispatchEvent(event);
        return result.translations; // Return translations for direct use
      } else {
        console.error("Translation failed:", result.error);
        alert(`Translation failed: ${result.error || "Unknown error"}`);
        return null;
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please check your API key and try again.");
      return null;
    }
  };

  const handleSaveSettings = (settings: any) => {
    console.log("Save settings:", settings);
    // In a real implementation, we would save the settings
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Dashboard Header */}
      <DashboardHeader
        onImport={handleImport}
        onExport={handleExport}
        onSettingsOpen={handleSettingsOpen}
        onManageLanguages={handleManageLanguages}
        onCreateNamespace={() => {
          const name = prompt("Enter namespace name");
          if (name) handleCreateNamespace(name);
        }}
        projectName="Translation Management"
      />

      {/* Main Content */}
      <div className="flex flex-1 p-6">
        {/* Main Translation Table */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Namespace Selector */}
          <div className="flex items-center justify-between">
            <NamespaceSelector
              selectedNamespace={selectedNamespace}
              onNamespaceSelect={handleNamespaceSelect}
              onNamespaceCreate={handleCreateNamespace}
              onNamespaceDelete={handleDeleteNamespace}
            />
          </div>

          {/* Table Toolbar */}
          <div className="flex justify-between items-center">
            <TableToolbar
              onSearch={handleSearch}
              onAddKey={handleAddKey}
              onDeleteSelected={handleDeleteSelected}
              selectedCount={selectedKeys.length}
              onFilterChange={handleFilterChange}
            />
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Translation Table */}
          <div className="flex-1 overflow-hidden rounded-md border">
            <TranslationTable
              translationKeys={translationKeys.filter((key) => {
                if (currentFilter === "all") return true;
                if (currentFilter === "confirmed")
                  return key.status === "confirmed";
                if (currentFilter === "unconfirmed")
                  return key.status === "unconfirmed";
                return true;
              })}
              onEditKey={handleEditKey}
              onDeleteKey={handleDeleteKey}
              onSelectKeys={handleSelectKeys}
              languages={languages.map((lang) => lang.code)}
              onStartEditing={(keyId) => setEditingKey(keyId)}
              onFinishEditing={() => setEditingKey(null)}
            />
          </div>

          {/* Table Info */}
          <div className="text-sm text-muted-foreground">
            {selectedKeys.length > 0 ? (
              <p>{selectedKeys.length} keys selected</p>
            ) : (
              <p>Showing all keys in {selectedNamespace.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Import/Export Dialog */}
      <ImportExportMenu
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        translationData={{
          keys: translationKeys,
          languages: languages,
        }}
        onImportComplete={handleImportComplete}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSave={handleSaveSettings}
        languages={languages}
        onManageLanguages={handleManageLanguages}
        onApiIntegration={handleApiIntegration}
      />

      {/* No more Edit Key Dialog */}

      {/* Language Manager Dialog */}
      <LanguageManager
        open={languageManagerOpen}
        onOpenChange={setLanguageManagerOpen}
        languages={languages}
        onSave={handleSaveLanguages}
        defaultLanguage="en"
      />

      {/* API Key Generator Dialog (for demo/development) */}
      <ApiKeyGenerator
        open={apiKeyGeneratorOpen}
        onOpenChange={setApiKeyGeneratorOpen}
        projectId="translation-project-123"
      />

      {/* API Key Manager Dialog (for production) */}
      {process.env.NODE_ENV === "production" && (
        <ApiKeyManager
          open={apiKeyManagerOpen}
          onOpenChange={setApiKeyManagerOpen}
          projectId="translation-project-123"
        />
      )}

      {/* History Dialog */}
      {selectedHistoryKey && (
        <HistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          keyId={selectedHistoryKey.id}
          keyName={selectedHistoryKey.name}
        />
      )}
    </main>
  );
}
