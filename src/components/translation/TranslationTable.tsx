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
} from "lucide-react";

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

interface TranslationTableProps {
  translationKeys?: TranslationKey[];
  languages?: string[];
  onEditKey?: (key: TranslationKey) => void;
  onDeleteKey?: (key: TranslationKey) => void;
  onSelectKeys?: (keys: TranslationKey[]) => void;
}

const mockTranslationKeys: TranslationKey[] = [
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
  },
];

const mockLanguages = ["en", "fr", "es", "de"];

const TranslationTable: React.FC<TranslationTableProps> = ({
  translationKeys = mockTranslationKeys,
  languages = mockLanguages,
  onEditKey = () => {},
  onDeleteKey = () => {},
  onSelectKeys = () => {},
}) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

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
      translationKeys.filter((key) => newSelectedKeys.includes(key.id)),
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
                <TableCell className="font-medium">{key.key}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {key.description || "-"}
                </TableCell>
                <TableCell>{getStatusBadge(key.status)}</TableCell>
                <TableCell>{key.lastUpdated}</TableCell>
                <TableCell
                  key={`${key.id}_en`}
                  className="max-w-[200px] truncate font-medium"
                >
                  {key.translations["en"] || (
                    <span className="text-red-400 italic">
                      Missing base text
                    </span>
                  )}
                </TableCell>
                {languages
                  .filter((lang) => lang !== "en")
                  .map((lang) => (
                    <TableCell
                      key={`${key.id}_${lang}`}
                      className="max-w-[200px] truncate"
                    >
                      {key.translations[lang] || (
                        <span className="text-gray-400 italic">Empty</span>
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
