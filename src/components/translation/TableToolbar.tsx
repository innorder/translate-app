import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download, Upload, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableToolbarProps {
  onSearch?: (query: string) => void;
  onAddKey?: () => void;
  onDeleteSelected?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  selectedCount?: number;
  filterOptions?: { value: string; label: string }[];
  onFilterChange?: (value: string) => void;
}

const TableToolbar = ({
  onSearch = () => {},
  onAddKey = () => {},
  onDeleteSelected = () => {},
  onImport = () => {},
  onExport = () => {},
  selectedCount = 0,
  filterOptions = [
    { value: "all", label: "All Keys" },
    { value: "confirmed", label: "Confirmed" },
    { value: "unconfirmed", label: "Unconfirmed" },
  ],
  onFilterChange = () => {},
}: TableToolbarProps) => {
  return (
    <div className="w-full bg-background border-b p-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys..."
            className="pl-8 w-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <Select defaultValue="all" onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteSelected}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete ({selectedCount})
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>

        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>

        <Button onClick={onAddKey}>
          <Plus className="h-4 w-4 mr-1" />
          Add Key
        </Button>
      </div>
    </div>
  );
};

export default TableToolbar;
