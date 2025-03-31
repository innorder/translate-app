import { supabase } from "./supabase";

interface HistoryEntry {
  key_id: string;
  action: string;
  field: string;
  old_value?: string;
  new_value?: string;
  user_id?: string;
  user_email?: string;
}

export const recordHistory = async (entry: HistoryEntry) => {
  try {
    // Get current user info
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    // Create the history record
    const { data, error } = await supabase.from("translation_history").insert({
      ...entry,
      user_id: user?.id,
      user_email: user?.email,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error recording history:", error);
    return { success: false, error };
  }
};

export const getKeyHistory = async (keyId: string) => {
  try {
    const { data, error } = await supabase
      .from("translation_history")
      .select("*")
      .eq("key_id", keyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false, error };
  }
};
