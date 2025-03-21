import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";

interface HistoryItem {
  id: string;
  action: string;
  user_email: string;
  field: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

interface HistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyId: string;
  keyName: string;
}

const HistoryDialog = ({
  open,
  onOpenChange,
  keyId,
  keyName,
}: HistoryDialogProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (open && keyId) {
      fetchHistory();
    }
  }, [open, keyId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("translation_history")
        .select("*")
        .eq("key_id", keyId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getFilteredHistory = () => {
    if (activeTab === "all") return history;
    return history.filter((item) => item.field.includes(activeTab));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>History for "{keyName}"</DialogTitle>
          <DialogDescription>
            View all changes made to this translation key
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Changes</TabsTrigger>
            <TabsTrigger value="key">Key Info</TabsTrigger>
            <TabsTrigger value="translation">Translations</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[400px] rounded-md border p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p>Loading history...</p>
                </div>
              ) : getFilteredHistory().length > 0 ? (
                <div className="space-y-4">
                  {getFilteredHistory().map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 bg-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{item.action}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.user_email || "Unknown user"} •{" "}
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {item.field.replace("translation_", "")}
                        </span>
                      </div>

                      {(item.old_value || item.new_value) && (
                        <div className="mt-2 text-sm">
                          {item.old_value && (
                            <div className="mb-1">
                              <span className="font-medium">Previous: </span>
                              <span className="text-muted-foreground">
                                {item.old_value || "(empty)"}
                              </span>
                            </div>
                          )}
                          {item.new_value && (
                            <div>
                              <span className="font-medium">New: </span>
                              <span>{item.new_value}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No history found for this filter
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
