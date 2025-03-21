import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface NewKeyCardProps {
  keyId: string;
  languages: string[];
  onSave: (
    keyId: string,
    data: {
      key: string;
      description: string;
      translations: Record<string, string>;
    },
  ) => void;
  onCancel: () => void;
}

const NewKeyCard: React.FC<NewKeyCardProps> = ({
  keyId,
  languages,
  onSave,
  onCancel,
}) => {
  const [keyName, setKeyName] = useState("");
  const [description, setDescription] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>(
    languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}),
  );
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the key input when the component mounts
    if (keyInputRef.current) {
      keyInputRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    onSave(keyId, {
      key: keyName,
      description,
      translations,
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

  return (
    <div className="border rounded-lg overflow-hidden bg-accent/20 shadow-sm p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Input
            ref={keyInputRef}
            value={keyName}
            onChange={(e) => handleInputChange("key", e.target.value)}
            placeholder="Enter key name"
            className="h-8 text-sm w-full mb-2"
          />
          <Textarea
            value={description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Add description"
            className="min-h-[40px] text-sm w-full"
          />
        </div>
        <div className="flex items-start gap-2 ml-4">
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
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
          New
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date().toISOString().split("T")[0]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="border-b pb-1">
          <div className="text-xs font-medium mb-1">Base Text (EN)</div>
          <Input
            value={translations["en"] || ""}
            onChange={(e) => handleInputChange("lang_en", e.target.value)}
            placeholder="Enter base text"
            className="h-8 text-sm w-full"
          />
        </div>

        {languages
          .filter((lang) => lang !== "en")
          .map((lang) => (
            <div key={lang} className="pb-1">
              <div className="text-xs font-medium mb-1">
                {lang.toUpperCase()}
              </div>
              <Input
                value={translations[lang] || ""}
                onChange={(e) =>
                  handleInputChange(`lang_${lang}`, e.target.value)
                }
                placeholder="Translation"
                className="h-8 text-sm w-full"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default NewKeyCard;
