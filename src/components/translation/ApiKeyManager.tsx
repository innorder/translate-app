"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Check, Key, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from "@/components/auth/UserProvider";

interface ApiKeyManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

interface ApiKey {
  id: string;
  key: string;
  name: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
}

const ApiKeyManager = ({
  open,
  onOpenChange,
  projectId = "translation-project-123",
}: ApiKeyManagerProps) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string>("");
  const { user } = useUser();
  // Use the supabase client directly

  // Load API keys when dialog opens
  useEffect(() => {
    if (open && user) {
      loadApiKeys();
    }
  }, [open, user]);

  const loadApiKeys = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (err: any) {
      console.error("Error loading API keys:", err);
      setError(err.message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) {
      setError("Please enter a name for your API key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a random API key
      const newKeyValue = `trn_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

      // Save to database
      const { data, error } = await supabase
        .from("api_keys")
        .insert({
          key: newKeyValue,
          name: newKeyName,
          project_id: projectId,
          user_id: user?.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Show the new key to the user (only time they'll see the full key)
      setNewKey(newKeyValue);
      setNewKeyName("");

      // Refresh the list
      loadApiKeys();
    } catch (err: any) {
      console.error("Error generating API key:", err);
      setError(err.message || "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this API key? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId)
        .eq("user_id", user?.id);

      if (error) throw error;

      // Refresh the list
      loadApiKeys();
    } catch (err: any) {
      console.error("Error deleting API key:", err);
      setError(err.message || "Failed to delete API key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>API Key Management</DialogTitle>
          <DialogDescription>
            Create and manage API keys for secure access to your translation
            data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Create New API Key</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                  <Button onClick={generateApiKey} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {newKey && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/30">
                  <Label htmlFor="apiKey">
                    Your New API Key (copy now - you won't see it again)
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        value={newKey}
                        readOnly
                        className="pr-10 font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => copyToClipboard(newKey, "newKey")}
                      >
                        {copied === "newKey" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this key secure. It provides access to your translation
                    data. For security reasons, we won't show the full key
                    again.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Your API Keys</h3>
            {loading && !apiKeys.length ? (
              <div className="text-center py-4">Loading...</div>
            ) : apiKeys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>{formatDate(key.created_at)}</TableCell>
                      <TableCell>{formatDate(key.last_used_at)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${key.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {key.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteApiKey(key.id)}
                          title="Delete API key"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No API keys found. Create one to get started.
              </div>
            )}
          </div>

          <div className="space-y-2 p-4 border rounded-md bg-muted/30">
            <h4 className="text-sm font-medium flex items-center">
              <Key className="h-4 w-4 mr-2" />
              API Security Best Practices
            </h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>
                Never share your API keys in public repositories or client-side
                code
              </li>
              <li>Rotate your keys periodically for enhanced security</li>
              <li>
                Use environment variables to store API keys in your applications
              </li>
              <li>
                Create separate keys for different environments (development,
                staging, production)
              </li>
              <li>Delete unused API keys to minimize security risks</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyManager;
