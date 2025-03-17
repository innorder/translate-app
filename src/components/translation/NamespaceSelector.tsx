import React, { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Namespace {
  id: string;
  name: string;
}

interface NamespaceSelectorProps {
  selectedNamespace?: Namespace;
  namespaces?: Namespace[];
  onNamespaceSelect?: (namespace: Namespace) => void;
  onNamespaceCreate?: (name: string) => void;
  onNamespaceDelete?: (id: string) => void;
}

const NamespaceSelector = ({
  selectedNamespace = { id: "default", name: "Default Namespace" },
  namespaces = [
    { id: "default", name: "Default Namespace" },
    { id: "common", name: "Common Strings" },
    { id: "errors", name: "Error Messages" },
  ],
  onNamespaceSelect = () => {},
  onNamespaceCreate = () => {},
  onNamespaceDelete = () => {},
}: NamespaceSelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newNamespaceName, setNewNamespaceName] = useState("");
  const [namespaceToDelete, setNamespaceToDelete] = useState<Namespace | null>(
    null,
  );

  const handleCreateNamespace = () => {
    if (newNamespaceName.trim()) {
      onNamespaceCreate(newNamespaceName.trim());
      setNewNamespaceName("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteNamespace = () => {
    if (namespaceToDelete) {
      onNamespaceDelete(namespaceToDelete.id);
      setNamespaceToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (namespace: Namespace, e: React.MouseEvent) => {
    e.stopPropagation();
    setNamespaceToDelete(namespace);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="bg-background w-[300px]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{selectedNamespace.name}</span>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          {namespaces.map((namespace) => (
            <DropdownMenuItem
              key={namespace.id}
              className="flex justify-between items-center"
              onClick={() => onNamespaceSelect(namespace)}
            >
              <span className="truncate">{namespace.name}</span>
              {namespace.id !== "default" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => openDeleteDialog(namespace, e)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Namespace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Namespace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Namespace</DialogTitle>
            <DialogDescription>
              Enter a name for your new translation namespace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Namespace name"
              value={newNamespaceName}
              onChange={(e) => setNewNamespaceName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNamespace}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Namespace Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Namespace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the namespace "
              {namespaceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNamespace}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NamespaceSelector;
