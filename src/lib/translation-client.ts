/**
 * Translation Client for real-world applications
 *
 * This client can be used to connect to your own backend API
 * or directly to Google Translate API if you're handling authentication client-side
 */

export interface TranslationOptions {
  apiKey: string;
  projectId: string;
  baseUrl?: string;
}

export class TranslationClient {
  private apiKey: string;
  private projectId: string;
  private baseUrl: string;
  private cache: Record<string, any>;

  constructor(options: TranslationOptions) {
    this.apiKey = options.apiKey;
    this.projectId = options.projectId;
    this.baseUrl = options.baseUrl || "/api/translations"; // Default to relative path
    this.cache = {};
  }

  /**
   * Fetch translations from your API
   */
  async fetchTranslations(locale = "en", namespace = "default") {
    const cacheKey = `${locale}-${namespace}`;

    // Return cached data if available
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const response = await fetch(
        `${this.baseUrl}?namespace=${namespace}&locale=${locale}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Project-ID": this.projectId,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch translations");

      const data = await response.json();
      this.cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error("Translation fetch error:", error);
      return {};
    }
  }

  /**
   * Translate a key using the provided translations object
   */
  translate(
    key: string,
    params: Record<string, string> = {},
    translations: Record<string, string> = {},
  ) {
    if (!translations[key]) return key;

    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp(`{{${paramName}}}`, "g"), value);
    });

    return text;
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {};
  }
}
