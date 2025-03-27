import { supabase } from "./supabase";

export interface TranslationKey {
  id: string;
  key: string;
  description?: string;
  namespace_id?: string;
  project_id?: string;
  status: "confirmed" | "unconfirmed";
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export const saveTranslationKey = async (translationKey: TranslationKey) => {
  try {
    console.log("Saving translation key:", translationKey);

    // Validate that the ID is a proper UUID
    if (translationKey.id && translationKey.id.startsWith("new-")) {
      console.error("Invalid UUID format. ID cannot start with 'new-'");
      throw new Error("Invalid UUID format");
    }

    // Ensure key is not empty
    if (!translationKey.key || translationKey.key.trim() === "") {
      console.error("Key cannot be empty");
      throw new Error("Key cannot be empty");
    }

    // Check if key already exists
    const { data: existingKey, error: checkError } = await supabase
      .from("translation_keys")
      .select("*")
      .eq("id", translationKey.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing key:", checkError);
      throw checkError;
    }

    if (existingKey) {
      console.log("Updating existing key:", existingKey.id);
      // Update existing key
      const { data, error } = await supabase
        .from("translation_keys")
        .update({
          key: translationKey.key,
          description: translationKey.description || "", // Ensure empty string instead of null
          status: translationKey.status,
          updated_at: new Date().toISOString(),
          updated_by: translationKey.updated_by || null,
        })
        .eq("id", translationKey.id)
        .select();

      if (error) {
        console.error("Error updating key:", error);
        throw error;
      }

      console.log("Key updated successfully:", data);
      return { success: true, data };
    } else {
      console.log("Inserting new key with ID:", translationKey.id);
      // Insert new key
      const { data, error } = await supabase
        .from("translation_keys")
        .insert({
          id: translationKey.id,
          key: translationKey.key,
          description: translationKey.description || "", // Ensure empty string instead of null
          namespace_id: translationKey.namespace_id || "default", // Provide default namespace
          project_id: translationKey.project_id || null,
          status: translationKey.status || "unconfirmed", // Provide default status
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: translationKey.created_by || null,
          updated_by: translationKey.updated_by || null,
        })
        .select();

      if (error) {
        console.error("Error inserting key:", error);
        throw error;
      }

      console.log("Key inserted successfully:", data);
      return { success: true, data };
    }
  } catch (error) {
    console.error("Error saving translation key:", error);
    return { success: false, error };
  }
};

export const fetchTranslationKeys = async (projectId?: string) => {
  try {
    let query = supabase.from("translation_keys").select("*");

    // If projectId is provided, filter by it
    if (projectId) {
      console.log("Fetching translation keys for project ID:", projectId);
      query = query.eq("project_id", projectId);
    } else {
      console.log("Fetching all translation keys");
    }

    const { data: keysData, error: keysError } = await query;

    if (keysError) throw keysError;

    // Fetch all translations for these keys
    const { data: translationsData, error: translationsError } = await supabase
      .from("translations")
      .select("*")
      .in(
        "key_id",
        keysData.map((key) => key.id),
      );

    if (translationsError) throw translationsError;

    // Group translations by key_id
    const translationsByKeyId: Record<string, any[]> = {};
    translationsData.forEach((translation) => {
      if (!translationsByKeyId[translation.key_id]) {
        translationsByKeyId[translation.key_id] = [];
      }
      translationsByKeyId[translation.key_id].push(translation);
    });

    // Fetch translation history for these keys
    const { data: historyData, error: historyError } = await supabase
      .from("translation_history")
      .select("*")
      .in(
        "translation_id",
        translationsData.map((translation) => translation.id),
      )
      .order("performed_at", { ascending: false });

    if (historyError) throw historyError;

    // Group history by translation_id
    const historyByTranslationId: Record<string, any[]> = {};
    historyData?.forEach((history) => {
      if (!historyByTranslationId[history.translation_id]) {
        historyByTranslationId[history.translation_id] = [];
      }
      historyByTranslationId[history.translation_id].push(history);
    });

    // Map keys to the expected format
    const formattedKeys = keysData.map((key) => {
      const keyTranslations = translationsByKeyId[key.id] || [];
      const translations: Record<string, string> = {};
      const history: any[] = [];

      keyTranslations.forEach((translation) => {
        translations[translation.language_code] = translation.value;

        // Add history for this translation if available
        const translationHistory = historyByTranslationId[translation.id] || [];
        translationHistory.forEach((h) => {
          history.push({
            action: h.action,
            user: h.performed_by || "system",
            timestamp: new Date(h.performed_at).toISOString().split("T")[0],
            field: translation.language_code,
            old_value: h.previous_value,
            new_value: h.new_value,
          });
        });
      });

      return {
        id: key.id,
        key: key.key,
        description: key.description || "",
        lastUpdated: key.updated_at
          ? new Date(key.updated_at).toISOString().split("T")[0]
          : new Date(key.created_at).toISOString().split("T")[0],
        status: key.status || "unconfirmed",
        translations,
        namespace_id: key.namespace_id,
        history: history
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 10),
      };
    });

    return { success: true, data: formattedKeys };
  } catch (error) {
    console.error("Error fetching translation keys:", error);
    return { success: false, error };
  }
};

export const deleteTranslationKey = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("translation_keys")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting translation key:", error);
    return { success: false, error };
  }
};
