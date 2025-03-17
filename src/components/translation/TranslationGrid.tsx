"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Check,
  X,
  Globe,
  Edit,
  Trash2,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface TranslationKey {
  id: string;
  key: string;
  description?: string;
  lastUpdated: string;
  status: "complete" | "incomplete" | "outdated";
  translations: {
    [language: string]: string;
  };
  history?: {
    action: string;
    user: string;
    timestamp: string;
  }[];
}

interface TranslationGridProps {
  translationKeys?: TranslationKey[];
  languages?: string[];
  onEditKey?: any;
  onDeleteKey?: any;
  onSelectKeys?: any;
}

const TranslationGrid: React.FC<TranslationGridProps> = ({
  translationKeys = [],
  languages = ["en", "fr", "es", "de"],
  onEditKey = () => {},
  onDeleteKey = () => {},
  onSelectKeys = () => {},
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const handleSelectKey = (id: string, checked: boolean) => {
    const newSelectedKeys = checked
      ? [...selectedKeys, id]
      : selectedKeys.filter((key) => key !== id);

    setSelectedKeys(newSelectedKeys);
    onSelectKeys(
      translationKeys.filter((key) => newSelectedKeys.includes(key.id))
    );
  };

  const getStatusBadge = (status: TranslationKey["status"]) => {
    switch (status) {
      case "complete":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <Check className="mr-1 h-3 w-3" />
            Complete
          </span>
        );
      case "incomplete":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <X className="mr-1 h-3 w-3" />
            Incomplete
          </span>
        );
      case "outdated":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
            <Globe className="mr-1 h-3 w-3" />
            Outdated
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-card">
      {translationKeys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {translationKeys.map((key) => (
            <div
              key={key.id}
              className="border rounded-lg overflow-hidden bg-card shadow-sm"
            >
              <div className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={selectedKeys.includes(key.id)}
                      onCheckedChange={(checked) =>
                        handleSelectKey(key.id, !!checked)
                      }
                      aria-label={`Select ${key.key}`}
                      className="mt-1"
                    />
                    <div>
                      <h3 className="text-sm font-medium">{key.key}</h3>
                      {key.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {key.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditKey(key)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {}}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {key.history && key.history.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            History
                          </div>
                          {key.history.slice(0, 3).map((item, i) => (
                            <div key={i} className="px-2 py-1 text-xs">
                              <div className="font-medium">{item.action}</div>
                              <div className="text-muted-foreground flex justify-between">
                                <span>{item.user}</span>
                                <span>{item.timestamp}</span>
                              </div>
                            </div>
                          ))}
                          {key.history.length > 3 && (
                            <DropdownMenuItem>
                              View all history
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
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
                </div>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(key.status)}
                  <span className="text-xs text-muted-foreground">
                    Updated: {key.lastUpdated}
                  </span>
                </div>
              </div>
              <div className="p-4 pt-0">
                <div className="space-y-2">
                  <div className="border-b pb-1">
                    <div className="text-xs font-medium mb-1">
                      Base Text (EN)
                    </div>
                    <div className="text-sm">
                      {key.translations["en"] || (
                        <span className="text-red-400 italic">
                          Missing base text
                        </span>
                      )}
                    </div>
                  </div>
                  {languages
                    .filter((lang) => lang !== "en")
                    .map((lang) => (
                      <div key={lang} className="pb-1">
                        <div className="text-xs font-medium mb-1">
                          {lang.toUpperCase()}
                        </div>
                        <div className="text-sm">
                          {key.translations[lang] || (
                            <span className="text-gray-400 italic">Empty</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-4 pt-0 flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onEditKey(key)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Translations
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No translation keys found.</p>
        </div>
      )}
    </div>
  );
};

export default TranslationGrid;
