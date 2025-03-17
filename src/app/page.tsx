"use client";

import React, { useState } from "react";
import DashboardHeader from "@/components/translation/DashboardHeader";
import NamespaceSelector from "@/components/translation/NamespaceSelector";
import TranslationTable from "@/components/translation/TranslationTable";
import ImportExportMenu from "@/components/translation/ImportExportMenu";
// Activity panel removed
import TableToolbar from "@/components/translation/TableToolbar";
import TranslationKeyDialog from "@/components/translation/TranslationKeyDialog";
import SettingsDialog from "@/components/translation/SettingsDialog";
import LanguageManager from "@/components/translation/LanguageManager";
import ApiKeyGenerator from "@/components/translation/ApiKeyGenerator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Namespace {
  id: string;
  name: string;
}

interface TranslationKey {
  id: string;
  key: string;
  description?: string;
  lastUpdated: string;
  status: "complete" | "incomplete" | "outdated";
  translations: {
    [language: string]: string;
  };
}

export default function TranslationDashboard() {
  // State for dialogs
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editKeyDialogOpen, setEditKeyDialogOpen] = useState(false);
  const [languageManagerOpen, setLanguageManagerOpen] = useState(false);
  const [apiKeyGeneratorOpen, setApiKeyGeneratorOpen] = useState(false);
  const [currentEditKey, setCurrentEditKey] = useState<TranslationKey | null>(
    null,
  );

  // State for namespace selection
  const [selectedNamespace, setSelectedNamespace] = useState<Namespace>({
    id: "default",
    name: "Default Namespace",
  });

  // State for selected translation keys
  const [selectedKeys, setSelectedKeys] = useState<TranslationKey[]>([]);

  // State for all translation keys
  const [translationKeys, setTranslationKeys] = useState<TranslationKey[]>([
    {
      id: "1",
      key: "welcome.message",
      description: "Welcome message on homepage",
      lastUpdated: "2023-10-15",
      status: "complete",
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
      status: "complete",
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
      status: "incomplete",
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
      status: "outdated",
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
      status: "complete",
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

  // State for view mode
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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
        Object.keys(match.translations).forEach((lang) => {
          if (match.translations[lang]) {
            mergedTranslations[lang] = match.translations[lang];
          }
        });

        return {
          ...key,
          translations: mergedTranslations,
          lastUpdated: new Date().toISOString().split("T")[0],
          status: Object.keys(mergedTranslations).every(
            (lang) => !!mergedTranslations[lang],
          )
            ? "complete"
            : "incomplete",
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

              // Update status if now complete
              const allLanguagesPresent = languages
                .map((lang) => lang.code)
                .every(
                  (code) =>
                    key.translations[code] &&
                    key.translations[code].trim() !== "",
                );

              if (allLanguagesPresent) {
                key.status = "complete";
              }
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
    setApiKeyGeneratorOpen(true);
  };

  const handleSaveLanguages = (
    updatedLanguages: { code: string; name: string }[],
  ) => {
    setLanguages(updatedLanguages);
    console.log("Languages updated:", updatedLanguages);
  };

  // Handle translation key actions
  const handleAddKey = () => {
    setCurrentEditKey(null);
    setEditKeyDialogOpen(true);
  };

  const handleEditKey = (key: TranslationKey) => {
    setCurrentEditKey(key);
    setEditKeyDialogOpen(true);
  };

  const handleDeleteKey = (key: TranslationKey) => {
    console.log("Delete key:", key);
    // Add to deletion history before removing
    const currentDate = new Date().toISOString().split("T")[0];
    const currentUser = "Current User"; // In a real app, get from auth

    // Log the deletion in history (in a real app, you might store this elsewhere)
    console.log(`Key "${key.key}" deleted by ${currentUser} on ${currentDate}`);

    setTranslationKeys((prevKeys) => prevKeys.filter((k) => k.id !== key.id));
  };

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
    // In a real implementation, we would filter the keys based on the filter
  };

  const handleSaveKey = (data: any) => {
    console.log("Save key:", data);
    const currentDate = new Date().toISOString().split("T")[0];
    const currentUser = "Current User"; // In a real app, get from auth

    // Check if we're editing an existing key or creating a new one
    if (currentEditKey) {
      // Update existing key
      setTranslationKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === currentEditKey.id
            ? {
                ...key,
                key: data.key,
                description: data.description,
                translations: data.translations,
                lastUpdated: currentDate,
                status: Object.keys(data.translations).every(
                  (lang) => !!data.translations[lang],
                )
                  ? "complete"
                  : "incomplete",
                history: [
                  {
                    action: "Updated translations",
                    user: currentUser,
                    timestamp: currentDate,
                  },
                  ...(key.history || []),
                ],
              }
            : key,
        ),
      );
    } else {
      // Create new key
      const newKey: TranslationKey = {
        id: Date.now().toString(), // Generate a unique ID
        key: data.key,
        description: data.description,
        translations: data.translations,
        lastUpdated: currentDate,
        status: Object.keys(data.translations).every(
          (lang) => !!data.translations[lang],
        )
          ? "complete"
          : "incomplete",
        history: [
          {
            action: "Created",
            user: currentUser,
            timestamp: currentDate,
          },
        ],
      };

      setTranslationKeys((prevKeys) => [...prevKeys, newKey]);
    }

    // Close the dialog and reset current edit key
    setEditKeyDialogOpen(false);
    setCurrentEditKey(null);
  };

  const handleAutoTranslate = async (
    sourceLanguage: string,
    targetLanguages: string[],
  ) => {
    console.log("Auto translate from", sourceLanguage, "to", targetLanguages);

    // Get the API key from settings
    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("translationApiKey")
        : null;
    if (!apiKey) {
      alert("Please add a Google Translate API key in Settings > API first");
      setSettingsOpen(true);
      return;
    }

    try {
      // Set translating state if we're in the edit dialog
      if (currentEditKey) {
        setCurrentEditKey({
          ...currentEditKey,
          isTranslating: true,
        });
      }

      // Import the translation API dynamically
      const { translateText } = await import("@/lib/translation-api");

      // Get the source text (always from the base language - English)
      // If we're in the edit dialog, use the current edit key
      // Otherwise, use the data from the dialog
      let sourceText;
      if (currentEditKey) {
        sourceText = currentEditKey.translations["en"];
      } else {
        // This is for when we're adding a new key
        const dialogData = document.getElementById(
          "en-base-text",
        ) as HTMLTextAreaElement;
        sourceText = dialogData?.value || "";
      }

      if (!sourceText) {
        alert(`Base text is empty. Please add text in English first.`);
        return;
      }

      // Call the translation API
      const result = await translateText({
        sourceLanguage: "en",
        targetLanguages,
        text: sourceText,
        apiKey,
      });

      if (result.success) {
        if (currentEditKey) {
          // Update the current edit key with the translations
          const updatedTranslations = { ...currentEditKey.translations };

          // Merge the new translations
          Object.keys(result.translations).forEach((lang) => {
            updatedTranslations[lang] = result.translations[lang];
          });

          // Update the current edit key
          setCurrentEditKey({
            ...currentEditKey,
            translations: updatedTranslations,
            isTranslating: false,
          });
        } else {
          // We're in the add key dialog, update the form fields
          const event = new CustomEvent("auto-translate-complete", {
            detail: { translations: result.translations },
          });
          document.dispatchEvent(event);
        }
      } else {
        alert(`Translation failed: ${result.error || "Unknown error"}`);
        if (currentEditKey) {
          setCurrentEditKey({
            ...currentEditKey,
            isTranslating: false,
          });
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      alert("Translation failed. Please check your API key and try again.");
      if (currentEditKey) {
        setCurrentEditKey({
          ...currentEditKey,
          isTranslating: false,
        });
      }
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
        onApiIntegration={handleApiIntegration}
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

            <div className="flex items-center gap-2">
              <Tabs defaultValue="table" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="table"
                    onClick={() => setViewMode("table")}
                  >
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="grid" onClick={() => setViewMode("grid")}>
                    Grid
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Table Toolbar */}
          <TableToolbar
            onSearch={handleSearch}
            onAddKey={handleAddKey}
            onDeleteSelected={handleDeleteSelected}
            onImport={handleImport}
            onExport={handleExport}
            selectedCount={selectedKeys.length}
            onFilterChange={handleFilterChange}
          />

          {/* Translation Table/Grid */}
          <div className="flex-1 overflow-hidden rounded-md border">
            {viewMode === "table" ? (
              <TranslationTable
                translationKeys={translationKeys}
                onEditKey={handleEditKey}
                onDeleteKey={handleDeleteKey}
                onSelectKeys={handleSelectKeys}
                languages={languages.map((lang) => lang.code)}
              />
            ) : (
              <TranslationGrid
                translationKeys={translationKeys}
                onEditKey={handleEditKey}
                onDeleteKey={handleDeleteKey}
                onSelectKeys={handleSelectKeys}
                languages={languages.map((lang) => lang.code)}
              />
            )}
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
      />

      {/* Edit Key Dialog */}
      <TranslationKeyDialog
        open={editKeyDialogOpen}
        onOpenChange={setEditKeyDialogOpen}
        editMode={!!currentEditKey}
        initialData={currentEditKey || undefined}
        onSave={handleSaveKey}
        onAutoTranslate={handleAutoTranslate}
        languages={languages}
      />

      {/* Language Manager Dialog */}
      <LanguageManager
        open={languageManagerOpen}
        onOpenChange={setLanguageManagerOpen}
        languages={languages}
        onSave={handleSaveLanguages}
        defaultLanguage="en"
      />

      {/* API Key Generator Dialog */}
      <ApiKeyGenerator
        open={apiKeyGeneratorOpen}
        onOpenChange={setApiKeyGeneratorOpen}
        projectId="translation-project-123"
      />
    </main>
  );
}
