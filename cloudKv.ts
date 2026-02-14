import { supabase, isSupabaseEnabled } from "./supabase";
import { getTenantId } from "./tenant";

const TABLE = "helm_kv";

export type KvRecord<T = any> = {
  tenant_id?: string;
  key: string;
  data: T;
  updated_at?: string;
};

export async function kvGet<T = any>(key: string): Promise<KvRecord<T> | null> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const tenant_id = await getTenantId();

  const { data, error } = await supabase
    .from(TABLE)
    .select("tenant_id,key,data,updated_at")
    .eq("tenant_id", tenant_id)
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return (data as KvRecord<T>) || null;
}

export async function kvSet<T = any>(key: string, value: T): Promise<KvRecord<T>> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const tenant_id = await getTenantId();

  const payload = { tenant_id, key, data: value };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "tenant_id,key" })
    .select("tenant_id,key,data,updated_at")
    .single();

  if (error) throw error;
  return data as KvRecord<T>;
}

export async function kvDelete(key: string): Promise<void> {
  if (!isSupabaseEnabled || !supabase) throw new Error("Supabase not configured");

  const tenant_id = await getTenantId();

  const { error } = await supabase.from(TABLE).delete().eq("tenant_id", tenant_id).eq("key", key);
  if (error) throw error;
}
