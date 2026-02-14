import { supabase, isSupabaseEnabled } from "./supabase";
import { clearTenantCache } from "./tenant";
import { UserRole } from "../types";

export type Profile = {
  id: string;
  tenant_id: string;
  role: UserRole;
  display_name: string | null;
};

export async function getSessionUserId(): Promise<string | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  clearTenantCache();
}

export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
  clearTenantCache();
}

export async function fetchMyProfile(): Promise<Profile | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const userId = await getSessionUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,tenant_id,role,display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile) || null;
}
