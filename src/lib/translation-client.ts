/**
 * Translation Client for real-world applications
 *
 * This client can be used to connect to your own backend API
 * or directly to Google Translate API if you're handling authentication client-side
 */

import { supabase } from "./supabase";

export interface TranslationOptions {
  apiKey: string;
  projectId: string;
  baseUrl?: string;
}

export interface Translation {
  id?: string;
  key_id: string;
  language_code: string;
  value: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
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

/**
 * Save a translation to the database
 */
export const saveTranslation = async (translation: Translation) => {
  try {
    // Validate input parameters
    if (!translation.key_id) {
      console.error("Missing key_id in translation");
      return { success: false, error: "Missing key_id" };
    }

    // Log the key ID but don't validate format - accept any string ID
    console.log("Processing translation for key ID:", translation.key_id);

    if (!translation.language_code) {
      console.error("Missing language_code in translation");
      return { success: false, error: "Missing language_code" };
    }

    if (translation.value === undefined || translation.value === null) {
      console.error("Missing value in translation");
      return { success: false, error: "Missing value" };
    }

    // Ensure value is not empty for English (base text)
    if (translation.language_code === "en" && translation.value.trim() === "") {
      console.error("Base text (English) cannot be empty");
      return { success: false, error: "Base text cannot be empty" };
    }

    // Check if translation already exists
    const { data: existingTranslation, error: checkError } = await supabase
      .from("translations")
      .select("*")
      .eq("key_id", translation.key_id)
      .eq("language_code", translation.language_code)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing translation:", checkError);
      throw checkError;
    }

    const timestamp = new Date().toISOString();
    const updatedBy = translation.updated_by || null;

    if (existingTranslation) {
      // Store previous value in history before updating
      if (existingTranslation.value !== translation.value) {
        const { error: historyError } = await supabase
          .from("translation_history")
          .insert({
            translation_id: existingTranslation.id,
            action: "update",
            previous_value: existingTranslation.value,
            new_value: translation.value,
            performed_at: timestamp,
            performed_by: updatedBy,
          });

        if (historyError) {
          console.error("Error saving translation history:", historyError);
          // Continue with the update even if history fails
        }
      }

      // Update existing translation
      const { data, error } = await supabase
        .from("translations")
        .update({
          value: translation.value,
          updated_at: timestamp,
          updated_by: updatedBy,
        })
        .eq("id", existingTranslation.id)
        .select();

      if (error) {
        console.error("Error updating translation:", error);
        throw error;
      }

      console.log(
        `Successfully updated translation for ${translation.language_code}`,
      );
      return { success: true, data };
    } else {
      // Insert new translation
      const { data, error } = await supabase
        .from("translations")
        .insert({
          key_id: translation.key_id,
          language_code: translation.language_code,
          value: translation.value || "", // Ensure empty string instead of null/undefined
          created_at: timestamp,
          updated_at: timestamp,
          created_by: translation.created_by || updatedBy,
          updated_by: updatedBy,
        })
        .select();

      if (error) {
        console.error("Error inserting translation:", error);
        throw error;
      }

      // Add history entry for new translation
      if (data && data[0]) {
        const { error: historyError } = await supabase
          .from("translation_history")
          .insert({
            translation_id: data[0].id,
            action: "create",
            new_value: translation.value,
            performed_at: timestamp,
            performed_by: updatedBy,
          });

        if (historyError) {
          console.error("Error saving translation history:", historyError);
          // Continue even if history fails
        }
      }

      console.log(
        `Successfully created new translation for ${translation.language_code}`,
      );
      return { success: true, data };
    }
  } catch (error) {
    console.error("Error saving translation:", error);
    return { success: false, error };
  }
};

/**
 * Fetch translations for a specific key
 */
export const fetchTranslations = async (keyId: string) => {
  try {
    // Ensure keyId is a valid string before making the request
    if (!keyId || typeof keyId !== "string") {
      console.error("Invalid key ID provided:", keyId);
      return { success: false, error: "Invalid key ID" };
    }

    // Log the key ID but don't validate format
    console.log("Fetching translations for key ID:", keyId);

    const { data, error } = await supabase
      .from("translations")
      .select("*")
      .eq("key_id", keyId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching translations:", error);
    return { success: false, error };
  }
};

/**
 * Fetch all translations
 */
export const fetchAllTranslations = async () => {
  try {
    const { data, error } = await supabase.from("translations").select("*");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching all translations:", error);
    return { success: false, error };
  }
};
