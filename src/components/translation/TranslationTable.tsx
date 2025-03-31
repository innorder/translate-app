"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "../ui/table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Globe,
  Check,
  X,
  Save,
} from "lucide-react";
import InlineEditableCell from "./InlineEditableCell";
import InlineEditableKeyCell from "./InlineEditableKeyCell";
import NewKeyRow from "./NewKeyRow";

export interface TranslationKey {
  id: string;
  key: string;
  description?: string;
  lastUpdated: string;
  status: string;
  translations: {
    [language: string]: string;
  };
  history?: Array<{
    action: string;
    user: string;
    timestamp: string;
    field?: string;
    old_value?: string;
    new_value?: string;
  }>;
}

interface TranslationTableProps {
  translationKeys?: TranslationKey[];
  languages?: string[];
  onEditKey?: (key: TranslationKey, isInlineEdit?: boolean) => void;
  onDeleteKey?: (key: TranslationKey) => void;
  onSelectKeys?: (keys: TranslationKey[]) => void;
  onStartEditing?: (keyId: string) => void;
  onFinishEditing?: () => void;
}

const mockTranslationKeys: TranslationKey[] = [
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
  },
];

const mockLanguages = ["en", "fr", "es", "de"];

const TranslationTable: React.FC<TranslationTableProps> = ({
  translationKeys = mockTranslationKeys,
  languages = mockLanguages,
  onEditKey = () => {},
  onDeleteKey = () => {},
  onSelectKeys = () => {},
  onStartEditing = () => {},
  onFinishEditing = () => {},
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingLang, setEditingLang] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedTranslations, setEditedTranslations] = useState<
    Record<string, Record<string, string>>
  >({});
  const [newKeyId, setNewKeyId] = useState<string | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });
  };

  const sortedKeys = React.useMemo(() => {
    const keysCopy = [...translationKeys];

    if (sortConfig) {
      keysCopy.sort((a, b) => {
        if (sortConfig.key === "key") {
          return sortConfig.direction === "asc"
            ? a.key.localeCompare(b.key)
            : b.key.localeCompare(a.key);
        } else if (sortConfig.key === "status") {
          return sortConfig.direction === "asc"
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        } else if (sortConfig.key === "lastUpdated") {
          return sortConfig.direction === "asc"
            ? new Date(a.lastUpdated).getTime() -
                new Date(b.lastUpdated).getTime()
            : new Date(b.lastUpdated).getTime() -
                new Date(a.lastUpdated).getTime();
        } else if (sortConfig.key.startsWith("lang_")) {
          const lang = sortConfig.key.split("_")[1];
          const aValue = a.translations[lang] || "";
          const bValue = b.translations[lang] || "";
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return keysCopy;
  }, [translationKeys, sortConfig]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedKeys(translationKeys.map((key) => key.id));
      onSelectKeys(translationKeys);
    } else {
      setSelectedKeys([]);
      onSelectKeys([]);
    }
  };

  const handleSelectKey = (id: string, checked: boolean) => {
    const newSelectedKeys = checked
      ? [...selectedKeys, id]
      : selectedKeys.filter((key) => key !== id);

    setSelectedKeys(newSelectedKeys);
    onSelectKeys(
      translationKeys.filter((key) => newSelectedKeys.includes(key.id))
    );
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  const getStatusBadge = (status: TranslationKey["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Check className="mr-1 h-3 w-3" />
            Confirmed
          </span>
        );
      case "unconfirmed":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <X className="mr-1 h-3 w-3" />
            Unconfirmed
          </span>
        );
      default:
        return null;
    }
  };

  const handleStartEditing = (keyId: string, lang: string) => {
    setEditingKey(keyId);
    setEditingLang(lang);
    onStartEditing(keyId);

    // Initialize edited translations if not already present
    if (!editedTranslations[keyId]) {
      const key = translationKeys.find((k) => k.id === keyId);
      if (key) {
        setEditedTranslations((prev) => ({
          ...prev,
          [keyId]: { ...key.translations },
        }));
      }
    }
  };

  // Listen for start-inline-edit events
  React.useEffect(() => {
    const handleStartInlineEdit = (event: any) => {
      const { keyId, field } = event.detail;

      if (field === "key") {
        setEditingKey(keyId);
        setEditingField("key");
        return;
      }

      if (field === "description") {
        setEditingKey(keyId);
        setEditingField("description");
        return;
      }

      if (field.startsWith("translation_")) {
        const lang = field.replace("translation_", "");
        handleStartEditing(keyId, lang);
      }
    };

    const handleAddNewKey = () => {
      // Generate a unique ID for the new key
      const newId = `new-${Date.now()}`;
      setNewKeyId(newId);
      onStartEditing(newId);
    };

    // Handle auto-translate event with database persistence
    const handleAutoTranslate = async (event: any) => {
      const {
        keyId,
        sourceLanguage,
        targetLanguages,
        translations,
        persistToDB,
      } = event.detail;

      // If we have translations and need to persist them
      if (persistToDB && translations) {
        const keyToUpdate = translationKeys.find((k) => k.id === keyId);
        if (keyToUpdate) {
          try {
            // Import the saveTranslation function dynamically to avoid circular dependencies
            const { saveTranslation } = await import(
              "../../lib/translation-client"
            );

            // Save each translation to the database
            const savePromises = [];
            for (const [lang, value] of Object.entries(translations)) {
              if (lang !== sourceLanguage) {
                savePromises.push(
                  saveTranslation({
                    key_id: keyId,
                    language_code: lang,
                    value: value as string,
                    updated_by: "system_auto_translate",
                  })
                );
              }
            }

            // Wait for all translations to be saved
            await Promise.all(savePromises);

            // Update the UI to show the translations are saved
            const updatedKey = {
              ...keyToUpdate,
              translations: {
                ...keyToUpdate.translations,
                ...translations,
              },
              lastUpdated: new Date().toISOString().split("T")[0],
              status: "unconfirmed",
            };

            // Call the edit handler with the updated key
            onEditKey(updatedKey, true);

            // Log success message
            console.log(`Successfully saved translations for key: ${keyId}`);
          } catch (error) {
            console.error("Error saving translations:", error);
          }
        } else {
          console.error(`Key not found for ID: ${keyId}`);
        }
      }
    };

    document.addEventListener("start-inline-edit", handleStartInlineEdit);
    document.addEventListener("add-new-key", handleAddNewKey);
    document.addEventListener("auto-translate-result", handleAutoTranslate);

    return () => {
      document.removeEventListener("start-inline-edit", handleStartInlineEdit);
      document.removeEventListener("add-new-key", handleAddNewKey);
      document.removeEventListener(
        "auto-translate-result",
        handleAutoTranslate
      );
    };
  }, [translationKeys, onEditKey]);

  const handleSaveTranslation = (
    keyId: string,
    lang: string,
    value: string
  ) => {
    // Update the edited translations
    setEditedTranslations((prev) => ({
      ...prev,
      [keyId]: {
        ...prev[keyId],
        [lang]: value,
      },
    }));

    // Find the key to update
    const keyToUpdate = translationKeys.find((k) => k.id === keyId);
    if (keyToUpdate) {
      // Create an updated key with the new translation
      const updatedKey = {
        ...keyToUpdate,
        translations: {
          ...keyToUpdate.translations,
          [lang]: value,
        },
        lastUpdated: new Date().toISOString().split("T")[0],
        // Status remains unconfirmed when translations are updated
        status: "unconfirmed",
      };

      // Call the edit handler with the updated key, but pass a second parameter to indicate this is an inline edit
      // This will prevent the full dialog from opening
      onEditKey(updatedKey, true);

      // Dispatch an event to update the key in the parent component
      const event = new CustomEvent("update-key", {
        detail: { keyId, field: `translation_${lang}`, value },
      });
      document.dispatchEvent(event);
    }

    // Reset editing state after saving
    setEditingKey(null);
    setEditingLang(null);
    onFinishEditing();
  };

  const handleCancelEditing = () => {
    setEditingKey(null);
    setEditingLang(null);
    setEditingField(null);
    onFinishEditing();
  };

  // Handle saving a new key row
  const handleSaveNewKey = async (
    keyId: string,
    data: {
      key: string;
      description: string;
      translations: Record<string, string>;
    }
  ) => {
    console.log("Saving new key with ID:", keyId, "and data:", data);

    // Create a new key object
    const newKey: TranslationKey = {
      id: keyId,
      key: data.key,
      description: data.description,
      lastUpdated: new Date().toISOString().split("T")[0],
      // New keys are always unconfirmed until explicitly confirmed
      status: "unconfirmed",
      translations: data.translations,
    };

    try {
      // Import the translation key service to save the key to the database
      const { saveTranslationKey } = await import(
        "@/lib/translation-key-service"
      );
      const { saveTranslation } = await import("@/lib/translation-client");

      // Save the key to the database first
      const saveKeyResult = await saveTranslationKey({
        id: keyId,
        key: data.key,
        description: data.description || "",
        status: "unconfirmed",
        created_by: "user",
      });

      console.log(
        "Key saved to database from TranslationTable:",
        saveKeyResult
      );

      // Then save each translation
      const translationPromises = Object.entries(data.translations).map(
        ([lang, value]) => {
          if (value && value.trim() !== "") {
            return saveTranslation({
              key_id: keyId,
              language_code: lang,
              value: value,
              created_by: "user_manual_edit",
            });
          }
          return Promise.resolve({ success: true }); // Skip empty translations
        }
      );

      const translationResults = await Promise.all(translationPromises);
      console.log(
        "All translations saved to database from TranslationTable:",
        translationResults
      );
    } catch (error) {
      console.error(
        "Error saving key or translations to database from TranslationTable:",
        error
      );
    }

    // Dispatch an event to add the new key
    const event = new CustomEvent("add-key", {
      detail: { key: newKey },
    });
    document.dispatchEvent(event);

    // Clear the new key ID to hide the row
    setNewKeyId(null);
    onFinishEditing();
  };

  // Handle canceling a new key row
  const handleCancelNewKey = () => {
    setNewKeyId(null);
    onFinishEditing();
  };

  return (
    <div className="w-full rounded-md border bg-card">
      <Table>
        <TableCaption>
          Translation keys and their values across languages
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={
                  selectedKeys.length === translationKeys.length &&
                  translationKeys.length > 0
                }
                onCheckedChange={handleSelectAll}
                aria-label="Select all keys"
              />
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("key")}
            >
              <div className="flex items-center">Key {getSortIcon("key")}</div>
            </TableHead>
            <TableHead className="max-w-[200px]">Description</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status {getSortIcon("status")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("lastUpdated")}
            >
              <div className="flex items-center">
                Last Updated {getSortIcon("lastUpdated")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer font-bold"
              onClick={() => handleSort(`lang_en`)}
            >
              <div className="flex items-center">
                Base Text (EN) {getSortIcon(`lang_en`)}
              </div>
            </TableHead>
            {languages
              .filter((lang) => lang !== "en")
              .map((lang) => (
                <TableHead
                  key={lang}
                  className="cursor-pointer"
                  onClick={() => handleSort(`lang_${lang}`)}
                >
                  <div className="flex items-center">
                    {lang.toUpperCase()} {getSortIcon(`lang_${lang}`)}
                  </div>
                </TableHead>
              ))}
            <TableHead className="w-10">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* New Key Row */}
          {newKeyId && (
            <NewKeyRow
              keyId={newKeyId}
              languages={languages}
              onSave={handleSaveNewKey}
              onCancel={handleCancelNewKey}
            />
          )}

          {sortedKeys.length > 0 ? (
            sortedKeys.map((key) => (
              <TableRow
                key={key.id}
                data-state={
                  selectedKeys.includes(key.id) ? "selected" : undefined
                }
              >
                <TableCell>
                  <Checkbox
                    checked={selectedKeys.includes(key.id)}
                    onCheckedChange={(checked) =>
                      handleSelectKey(key.id, !!checked)
                    }
                    aria-label={`Select ${key.key}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {editingKey === key.id && editingField === "key" ? (
                    <div data-key-id={key.id} className="inline-edit-wrapper">
                      <InlineEditableKeyCell
                        value={key.key}
                        onSave={(value) => {
                          const event = new CustomEvent("update-key", {
                            detail: { keyId: key.id, field: "key", value },
                          });
                          document.dispatchEvent(event);
                          setEditingKey(null);
                          setEditingField(null);
                          onFinishEditing();
                        }}
                        onCancel={() => {
                          // If this is a new key with no value, remove it
                          if (!key.key) {
                            const event = new CustomEvent("delete-key", {
                              detail: { keyId: key.id },
                            });
                            document.dispatchEvent(event);
                          }
                          setEditingKey(null);
                          setEditingField(null);
                          onFinishEditing();
                        }}
                        placeholder="Enter key name"
                      />
                    </div>
                  ) : (
                    <div
                      className="p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => {
                        setEditingKey(key.id);
                        setEditingField("key");
                        onStartEditing(key.id);
                      }}
                    >
                      {key.key || (
                        <span className="text-red-400 italic">
                          Missing key name
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {editingKey === key.id && editingField === "description" ? (
                    <div data-key-id={key.id} className="inline-edit-wrapper">
                      <InlineEditableKeyCell
                        value={key.description || ""}
                        onSave={(value) => {
                          const event = new CustomEvent("update-key", {
                            detail: {
                              keyId: key.id,
                              field: "description",
                              value,
                            },
                          });
                          document.dispatchEvent(event);
                          setEditingKey(null);
                          setEditingField(null);
                          onFinishEditing();
                        }}
                        onCancel={() => {
                          setEditingKey(null);
                          setEditingField(null);
                          onFinishEditing();
                        }}
                        placeholder="Add description"
                        isTextarea={true}
                      />
                    </div>
                  ) : (
                    <div
                      className="p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => {
                        setEditingKey(key.id);
                        setEditingField("description");
                        onStartEditing(key.id);
                      }}
                    >
                      {key.description || (
                        <span className="text-gray-400 italic">
                          Add description
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(key.status)}</TableCell>
                <TableCell>{key.lastUpdated}</TableCell>
                <TableCell
                  key={`${key.id}_en`}
                  className="max-w-[200px] font-medium"
                >
                  {editingKey === key.id && editingLang === "en" ? (
                    <div
                      data-editing="true"
                      data-key-id={key.id}
                      className="inline-edit-wrapper"
                    >
                      <InlineEditableCell
                        value={
                          editedTranslations[key.id]?.en ||
                          key.translations["en"] ||
                          ""
                        }
                        onSave={(value) =>
                          handleSaveTranslation(key.id, "en", value)
                        }
                        onCancel={handleCancelEditing}
                        placeholder="Missing base text"
                        isBaseText={true}
                      />
                    </div>
                  ) : (
                    <div
                      className="p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                      onClick={() => handleStartEditing(key.id, "en")}
                    >
                      {key.translations["en"] || (
                        <span className="text-red-400 italic">
                          Missing base text
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                {languages
                  .filter((lang) => lang !== "en")
                  .map((lang) => (
                    <TableCell
                      key={`${key.id}_${lang}`}
                      className="max-w-[200px]"
                    >
                      {editingKey === key.id && editingLang === lang ? (
                        <div
                          data-editing="true"
                          data-key-id={key.id}
                          className="inline-edit-wrapper"
                        >
                          <InlineEditableCell
                            value={
                              editedTranslations[key.id]?.[lang] ||
                              key.translations[lang] ||
                              ""
                            }
                            onSave={(value) =>
                              handleSaveTranslation(key.id, lang, value)
                            }
                            onCancel={handleCancelEditing}
                            placeholder="Empty"
                          />
                        </div>
                      ) : (
                        <div
                          className="p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                          onClick={() => handleStartEditing(key.id, lang)}
                        >
                          {key.translations[lang] || (
                            <span className="text-gray-400 italic">Empty</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          // Auto-translate this key
                          const targetLanguages = languages
                            .filter((lang) => lang !== "en")
                            .map((lang) => lang);

                          // Log the key ID for debugging
                          console.log(
                            "Attempting to translate key with ID:",
                            key.id
                          );

                          // First ensure the English text is properly set in the state
                          if (
                            key.translations.en &&
                            key.translations.en.trim() !== ""
                          ) {
                            // Force an update to ensure the English text is recognized
                            const updateEvent = new CustomEvent("update-key", {
                              detail: {
                                keyId: key.id,
                                field: "translation_en",
                                value: key.translations.en,
                              },
                            });
                            document.dispatchEvent(updateEvent);

                            // Then trigger the translation
                            setTimeout(() => {
                              const event = new CustomEvent(
                                "auto-translate-key",
                                {
                                  detail: {
                                    keyId: key.id,
                                    sourceLanguage: "en",
                                    targetLanguages,
                                    persistToDB: true, // Add flag to indicate we want to persist to DB
                                  },
                                }
                              );
                              document.dispatchEvent(event);
                            }, 100);
                          } else {
                            // If no English text, just trigger the translation directly
                            const event = new CustomEvent(
                              "auto-translate-key",
                              {
                                detail: {
                                  keyId: key.id,
                                  sourceLanguage: "en",
                                  targetLanguages,
                                  persistToDB: true, // Add flag to indicate we want to persist to DB
                                },
                              }
                            );
                            document.dispatchEvent(event);
                          }
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Auto-Translate All
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          // Confirm translations
                          const event = new CustomEvent(
                            "confirm-translations",
                            {
                              detail: {
                                keyId: key.id,
                              },
                            }
                          );
                          document.dispatchEvent(event);
                        }}
                        disabled={key.status === "confirmed"}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Confirm Translations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <>
                        <DropdownMenuSeparator />
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                          History
                        </div>
                        {key.history && key.history.length > 0 ? (
                          <>
                            {key.history.slice(0, 3).map((item, i) => (
                              <div key={i} className="px-2 py-1 text-xs">
                                <div className="font-medium">{item.action}</div>
                                <div className="text-muted-foreground flex justify-between">
                                  <span>{item.user}</span>
                                  <span>{item.timestamp}</span>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="px-2 py-1 text-xs text-muted-foreground">
                            No recent history
                          </div>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            // Dispatch event to show history dialog
                            const event = new CustomEvent("view-key-history", {
                              detail: { keyId: key.id, keyName: key.key },
                            });
                            document.dispatchEvent(event);
                          }}
                        >
                          View all history
                        </DropdownMenuItem>
                      </>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteKey(key)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={7 + languages.length}
                className="h-24 text-center"
              >
                No translation keys found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TranslationTable;
