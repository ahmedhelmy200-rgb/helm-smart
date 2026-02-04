import { supabase, isSupabaseEnabled } from "./supabase";

const TABLE = "helm_kv";

export type KvRecord<T = any> = {
  key: string;
  data: T;
  updated_at?: string;
};

export async function kvGet<T = any>(key: string): Promise<KvRecord<T> | null> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from(TABLE)
    .select("key,data,updated_at")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return (data as KvRecord<T>) || null;
}

export async function kvSet<T = any>(key: string, value: T): Promise<KvRecord<T>> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const payload = { key, data: value };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "key" })
    .select("key,data,updated_at")
    .single();

  if (error) throw error;
  return data as KvRecord<T>;
}

export async function kvDelete(key: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.from(TABLE).delete().eq("key", key);
  if (error) throw error;
}
