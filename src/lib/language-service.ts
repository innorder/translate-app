import { supabase } from "./supabase";

export interface Language {
  id?: string;
  code: string;
  name: string;
  is_active?: boolean;
  is_base?: boolean;
  project_id?: string;
}

export const fetchLanguages = async (projectId?: string) => {
  try {
    let query = supabase.from("languages").select("*").eq("is_active", true);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data, error } = await query.order("is_base", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching languages:", error);
    return { success: false, error };
  }
};

export const addLanguage = async (language: Language) => {
  try {
    // Get the first project ID if not provided
    if (!language.project_id) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .limit(1);
      if (projects && projects.length > 0) {
        language.project_id = projects[0].id;
      }
    }

    const { data, error } = await supabase
      .from("languages")
      .insert({
        code: language.code,
        name: language.name,
        is_active: language.is_active !== undefined ? language.is_active : true,
        is_base: language.is_base || false,
        project_id: language.project_id,
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error adding language:", error);
    return { success: false, error };
  }
};

export const updateLanguage = async (
  id: string,
  updates: Partial<Language>,
) => {
  try {
    const { data, error } = await supabase
      .from("languages")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error updating language:", error);
    return { success: false, error };
  }
};

export const deleteLanguage = async (id: string) => {
  try {
    // Instead of deleting, we'll mark it as inactive
    const { data, error } = await supabase
      .from("languages")
      .update({ is_active: false })
      .eq("id", id)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error deleting language:", error);
    return { success: false, error };
  }
};
