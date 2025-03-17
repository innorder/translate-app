import React, { useState, useEffect } from "react";
import {
  Download,
  Upload,
  FileJson,
  FileText,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Alert, AlertDescription } from "../ui/alert";

interface ImportExportMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  translationData?: {
    keys: any[];
    languages: { code: string; name: string }[];
  };
  onImportComplete?: (data: any) => void;
}

interface PreviewData {
  keys: number;
  languages: string[];
  sample: Record<string, string>;
  fullData?: any;
}

const ImportExportMenu = ({
  open = true,
  onOpenChange,
  translationData = {
    keys: [],
    languages: [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "fr", name: "French" },
      { code: "de", name: "German" },
      { code: "it", name: "Italian" },
      { code: "ja", name: "Japanese" },
    ],
  },
  onImportComplete = () => {},
}: ImportExportMenuProps) => {
  const [activeTab, setActiveTab] = useState("export");
  const [exportFormat, setExportFormat] = useState("json");
  const [importFormat, setImportFormat] = useState("json");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected languages from available languages
  useEffect(() => {
    if (translationData.languages.length > 0) {
      setSelectedLanguages(translationData.languages.map((lang) => lang.code));
    }
  }, [translationData.languages]);

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      // Don't allow deselecting English (base language)
      if (code === "en") return;
      setSelectedLanguages((prevSelected) =>
        prevSelected.filter((lang) => lang !== code),
      );
    } else {
      setSelectedLanguages((prevSelected) => [...prevSelected, code]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setError(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let parsedData: any;
          let keyCount = 0;
          let detectedLanguages: string[] = [];
          let sampleEntries: Record<string, string> = {};

          // Parse based on file format
          if (importFormat === "json") {
            parsedData = JSON.parse(content);

            // Validate structure
            if (!parsedData || typeof parsedData !== "object") {
              throw new Error("Invalid JSON format");
            }

            // Count keys and detect languages
            keyCount = Object.keys(parsedData).length;

            // Get languages from the first entry
            if (keyCount > 0) {
              const firstKey = Object.keys(parsedData)[0];
              if (
                parsedData[firstKey] &&
                typeof parsedData[firstKey] === "object"
              ) {
                detectedLanguages = Object.keys(parsedData[firstKey]);
              }

              // Get sample entries (up to 3)
              const sampleKeys = Object.keys(parsedData).slice(0, 3);
              sampleKeys.forEach((key) => {
                if (parsedData[key].en) {
                  sampleEntries[key] = parsedData[key].en;
                }
              });
            }
          } else if (importFormat === "csv") {
            // Basic CSV parsing
            const lines = content.split("\n");
            if (lines.length < 2) {
              throw new Error(
                "CSV file must have at least a header row and one data row",
              );
            }

            // First line is header with languages
            const headers = lines[0].split(",").map((h) => h.trim());
            if (headers.length < 2 || headers[0] !== "key") {
              throw new Error(
                "CSV header must start with 'key' followed by language codes",
              );
            }

            detectedLanguages = headers.slice(1);
            keyCount = lines.length - 1; // Minus header

            // Convert to structured data
            parsedData = {};
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;

              const values = lines[i].split(",").map((v) => v.trim());
              const key = values[0];
              parsedData[key] = {};

              for (let j = 1; j < headers.length; j++) {
                parsedData[key][headers[j]] = values[j] || "";
              }

              // Add to sample if it's one of the first 3 entries
              if (i <= 3 && parsedData[key].en) {
                sampleEntries[key] = parsedData[key].en;
              }
            }
          } else if (importFormat === "yaml") {
            // Basic YAML parsing (simplified)
            setError(
              "YAML parsing is not fully implemented. Please use JSON or CSV format.",
            );
            return;
          }

          setPreviewData({
            keys: keyCount,
            languages: detectedLanguages,
            sample: sampleEntries,
            fullData: parsedData,
          });
        } catch (err) {
          console.error("Error parsing file:", err);
          setError(
            `Error parsing file: ${err instanceof Error ? err.message : "Unknown error"}`,
          );
          setPreviewData(null);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
        setPreviewData(null);
      };

      if (importFormat === "json") {
        reader.readAsText(file);
      } else if (importFormat === "csv") {
        reader.readAsText(file);
      } else if (importFormat === "yaml") {
        reader.readAsText(file);
      }
    } else {
      setPreviewData(null);
    }
  };

  const handleExport = () => {
    if (translationData.keys.length === 0) {
      alert("No translation keys to export");
      return;
    }

    try {
      // For JSON format, create separate files for each language
      if (exportFormat === "json") {
        // Create a zip file containing all language files
        import("jszip")
          .then(async (JSZip) => {
            const { default: JSZipModule } = JSZip;
            const zip = new JSZipModule();

            // Create a folder for each language
            selectedLanguages.forEach((langCode) => {
              // Create language-specific JSON object
              const langData: Record<string, string> = {};

              // Add all keys for this language
              translationData.keys.forEach((key) => {
                langData[key.key] = key.translations[langCode] || "";
              });

              // Add file to the language folder
              zip
                .folder(langCode)
                ?.file("common.json", JSON.stringify(langData, null, 2));
            });

            // Generate the zip file
            const content = await zip.generateAsync({ type: "blob" });

            // Trigger download
            const url = URL.createObjectURL(content);
            const element = document.createElement("a");
            element.href = url;
            element.download = "translations.zip";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            URL.revokeObjectURL(url);

            alert(`Exported ${selectedLanguages.length} language files as ZIP`);
          })
          .catch((error) => {
            console.error("JSZip loading error:", error);
            alert("Failed to load ZIP library. Please try again.");
          });
      } else {
        // For other formats, keep the existing implementation
        // Prepare data for export
        const exportData: Record<string, Record<string, string>> = {};

        // Filter keys by selected languages
        translationData.keys.forEach((key) => {
          exportData[key.key] = {};

          // Only include selected languages
          selectedLanguages.forEach((langCode) => {
            if (key.translations[langCode] !== undefined) {
              exportData[key.key][langCode] = key.translations[langCode];
            } else {
              exportData[key.key][langCode] = ""; // Empty string for missing translations
            }
          });
        });

        let fileContent = "";
        let mimeType = "";
        let fileExtension = "";

        if (exportFormat === "csv") {
          // Create CSV header
          const header = ["key", ...selectedLanguages].join(",");
          const rows = Object.keys(exportData).map((key) => {
            const values = [key];
            selectedLanguages.forEach((lang) => {
              // Escape commas in the value
              const value = exportData[key][lang] || "";
              values.push(`"${value.replace(/"/g, '""')}"`);
            });
            return values.join(",");
          });
          fileContent = [header, ...rows].join("\n");
          mimeType = "text/csv";
          fileExtension = "csv";
        } else if (exportFormat === "yaml") {
          // Simple YAML format
          const yamlLines: string[] = [];
          Object.keys(exportData).forEach((key) => {
            yamlLines.push(`${key}:`);
            selectedLanguages.forEach((lang) => {
              const value = exportData[key][lang] || "";
              yamlLines.push(`  ${lang}: "${value.replace(/"/g, '\\"')}"`);
            });
          });
          fileContent = yamlLines.join("\n");
          mimeType = "text/yaml";
          fileExtension = "yaml";
        }

        // Create and trigger download
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const element = document.createElement("a");
        element.href = url;
        element.download = `translations.${fileExtension}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export error:", err);
      alert(
        `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  const handleImport = () => {
    if (!previewData || !previewData.fullData) {
      setError("No valid data to import");
      return;
    }

    try {
      // Process the imported data
      const importedData = previewData.fullData;
      const now = new Date().toISOString().split("T")[0];

      // Convert to the format expected by the application
      const processedData = Object.keys(importedData).map((key, index) => {
        const translations = importedData[key];
        const allLanguagesPresent = previewData.languages.every(
          (lang) => translations[lang] && translations[lang].trim() !== "",
        );

        return {
          id: `imported_${index}_${Date.now()}`,
          key: key,
          description: "", // No description in import file
          lastUpdated: now,
          status: allLanguagesPresent ? "complete" : "incomplete",
          translations: translations,
        };
      });

      // Call the import complete callback with the processed data
      onImportComplete(processedData);

      // Reset state
      setImportFile(null);
      setPreviewData(null);
      setError(null);

      // Close dialog
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      console.error("Import processing error:", err);
      setError(
        `Import failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>Translation Import/Export</DialogTitle>
          <DialogDescription>
            Import or export your translation keys and values in various
            formats.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="export"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download size={16} />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload size={16} />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Export Format</label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson size={16} />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="yaml">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        YAML
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Languages to Export
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {translationData.languages.map((lang) => (
                    <div
                      key={lang.code}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`lang-${lang.code}`}
                        checked={selectedLanguages.includes(lang.code)}
                        onCheckedChange={() => toggleLanguage(lang.code)}
                        disabled={lang.code === "en"} // English is always required
                      />
                      <label
                        htmlFor={`lang-${lang.code}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {lang.name}
                        {lang.code === "en" && " (Required)"}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleExport}
                className="w-full sm:w-auto"
                disabled={
                  translationData.keys.length === 0 ||
                  selectedLanguages.length === 0
                }
              >
                <Download size={16} className="mr-2" />
                Export Translations
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Import Format</label>
                <Select value={importFormat} onValueChange={setImportFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileJson size={16} />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        CSV
                      </div>
                    </SelectItem>
                    <SelectItem value="yaml">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        YAML
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload File</label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-accent/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        {importFormat.toUpperCase()} file (max. 10MB)
                      </p>
                    </div>
                    <Input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept={`.${importFormat}`}
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {importFile && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check size={16} />
                    {importFile.name} selected
                  </p>
                )}
              </div>

              {previewData && (
                <div className="border rounded-md p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Keys:</span>{" "}
                      {previewData.keys}
                    </p>
                    <p>
                      <span className="font-medium">Languages:</span>{" "}
                      {previewData.languages.join(", ")}
                    </p>
                    <div>
                      <p className="font-medium">Sample:</p>
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto mt-1">
                        {JSON.stringify(previewData.sample, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setImportFile(null);
                  setPreviewData(null);
                  setError(null);
                }}
                disabled={!importFile}
              >
                <X size={16} className="mr-2" />
                Clear
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || !previewData || !!error}
                className="w-full sm:w-auto"
              >
                <Upload size={16} className="mr-2" />
                Import Translations
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportMenu;
