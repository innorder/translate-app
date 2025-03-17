"use client";

import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Key, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKeyGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

const ApiKeyGenerator = ({
  open,
  onOpenChange,
  projectId = "translation-project-123",
}: ApiKeyGeneratorProps) => {
  const [apiKey, setApiKey] = useState<string>("");

  // Initialize apiKey from localStorage on client-side only
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("translationApiKey");
      if (savedKey) setApiKey(savedKey);
    }
  }, []);
  const [keyName, setKeyName] = useState<string>("");
  const [copied, setCopied] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("react");

  const generateApiKey = () => {
    if (!keyName.trim()) {
      alert("Please enter a name for your API key");
      return;
    }

    // Generate a random API key
    const newKey = `trn_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      localStorage.setItem("translationApiKey", newKey);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const getCodeSnippet = (type: string) => {
    const baseUrl = "https://api.translation-service.com";

    switch (type) {
      case "react":
        return `import { useState, useEffect } from 'react';

const useTranslations = (namespace = 'default') => {
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(
          '${baseUrl}/api/translations?namespace=' + namespace,
          {
            headers: {
              'Authorization': 'Bearer ${apiKey}',
              'Project-ID': '${projectId}'
            }
          }
        );
        
        if (!response.ok) throw new Error('Failed to fetch translations');
        
        const data = await response.json();
        setTranslations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [namespace]);

  const t = (key, params = {}) => {
    if (!translations[key]) return key;
    
    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp("{{" + paramName + "}}", 'g'), value);
    });
    
    return text;
  };

  return { t, translations, loading, error };
};

export default useTranslations;`;

      case "next-app":
        return `// app/i18n.js
import { cache } from 'react';

export const getTranslations = cache(async (locale, namespace = 'default') => {
  try {
    const response = await fetch(
      '${baseUrl}/api/translations?namespace=' + namespace + '&locale=' + locale,
      {
        headers: {
          'Authorization': 'Bearer ${apiKey}',
          'Project-ID': '${projectId}'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch translations');
    
    return response.json();
  } catch (error) {
    console.error('Translation fetch error:', error);
    return {};
  }
});

// Usage in a Server Component:
// import { getTranslations } from '@/app/i18n';
// const translations = await getTranslations('en', 'common');

// Client Component wrapper
export function useTranslations(translations) {
  return {
    t: (key, params = {}) => {
      if (!translations[key]) return key;
      
      let text = translations[key];
      Object.entries(params).forEach(([paramName, value]) => {
        text = text.replace(new RegExp("{{" + paramName + "}}", 'g'), value);
      });
      
      return text;
    }
  };
}`;

      case "next-pages":
        return `// lib/translations.js
import { useState, useEffect } from 'react';

export async function getServerSideTranslations(locale, namespaces = ['default']) {
  try {
    const promises = namespaces.map(namespace =>
      fetch(
        '${baseUrl}/api/translations?namespace=' + namespace + '&locale=' + locale,
        {
          headers: {
            'Authorization': 'Bearer ${apiKey}',
            'Project-ID': '${projectId}'
          }
        }
      ).then(res => res.json())
    );

    const results = await Promise.all(promises);
    
    // Merge all namespace results
    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  } catch (error) {
    console.error('Translation fetch error:', error);
    return {};
  }
}

// Client-side hook
export function useTranslations(initialData = {}) {
  const [translations, setTranslations] = useState(initialData);

  const t = (key, params = {}) => {
    if (!translations[key]) return key;
    
    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp("{{" + paramName + "}}", 'g'), value);
    });
    
    return text;
  };

  return { t, translations };
}

// Usage in getServerSideProps:
// export async function getServerSideProps({ locale }) {
//   const translations = await getServerSideTranslations(locale, ['common']);
//   return { props: { translations } };
// }`;

      case "javascript":
        return `// translations.js
class TranslationClient {
  constructor(apiKey, projectId) {
    this.apiKey = apiKey;
    this.projectId = projectId;
    this.baseUrl = '${baseUrl}';
    this.cache = {};
  }

  async fetchTranslations(locale = 'en', namespace = 'default') {
    const cacheKey = locale + "-" + namespace;
    
    // Return cached data if available
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    
    try {
      const response = await fetch(
        this.baseUrl + "/api/translations?namespace=" + namespace + "&locale=" + locale,
        {
          headers: {
            'Authorization': 'Bearer ' + this.apiKey,
            'Project-ID': this.projectId
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch translations');
      
      const data = await response.json();
      this.cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error('Translation fetch error:', error);
      return {};
    }
  }

  translate(key, params = {}, translations = {}) {
    if (!translations[key]) return key;
    
    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp("{{" + paramName + "}}", 'g'), value);
    });
    
    return text;
  }
}

// Usage:
// const translationClient = new TranslationClient('${apiKey}', '${projectId}');
// const translations = await translationClient.fetchTranslations('en', 'common');
// const welcomeMessage = translationClient.translate('welcome.message', { name: 'John' }, translations);`;

      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>API Integration</DialogTitle>
          <DialogDescription>
            Generate an API key and get code snippets to integrate with your
            applications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">API Key</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API Key"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                  />
                  <Button onClick={generateApiKey}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {apiKey && (
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Your API Key</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        value={apiKey}
                        readOnly
                        className="pr-10 font-mono text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => copyToClipboard(apiKey, "apiKey")}
                      >
                        {copied === "apiKey" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this key secure. It provides access to your translation
                    data.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium">Integration Code Snippets</h3>
            <Tabs
              defaultValue="react"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="react">React</TabsTrigger>
                <TabsTrigger value="next-app">Next.js App</TabsTrigger>
                <TabsTrigger value="next-pages">Next.js Pages</TabsTrigger>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              </TabsList>

              {["react", "next-app", "next-pages", "javascript"].map((type) => (
                <TabsContent key={type} value={type} className="mt-4">
                  <div className="relative">
                    <pre className="p-4 rounded-md bg-muted overflow-x-auto text-sm font-mono">
                      {getCodeSnippet(type)}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        copyToClipboard(getCodeSnippet(type), type)
                      }
                    >
                      {copied === type ? (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {type === "react" && (
                      <p>
                        A React hook for fetching and using translations in
                        client components.
                      </p>
                    )}
                    {type === "next-app" && (
                      <p>
                        Server and client utilities for Next.js App Router with
                        React Server Components.
                      </p>
                    )}
                    {type === "next-pages" && (
                      <p>
                        Integration for Next.js Pages Router with
                        getServerSideProps support.
                      </p>
                    )}
                    {type === "javascript" && (
                      <p>
                        Vanilla JavaScript client for any JavaScript
                        application.
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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

export default ApiKeyGenerator;
