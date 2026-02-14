import { supabase, isSupabaseEnabled } from "./supabase";

let _tenantId: string | null = null;

function localTenant(): string {
  const k = "helm_local_tenant_id";
  const existing = localStorage.getItem(k);
  if (existing) return existing;
  // deterministic-enough for single-device offline mode
  const newId = `local_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(k, newId);
  return newId;
}

/**
 * Fetch tenant_id from profiles table using the current auth user.
 * Profiles schema is defined in /supabase/migrations.
 */
export async function getTenantId(): Promise<string> {
  if (_tenantId) return _tenantId;

  if (!isSupabaseEnabled || !supabase) {
    _tenantId = localTenant();
    return _tenantId;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) {
    _tenantId = "public";
    return _tenantId;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (error) {
    // In case profiles isn't ready yet, fall back to a stable local id.
    _tenantId = localTenant();
    return _tenantId;
  }

  _tenantId = data?.tenant_id || localTenant();
  return _tenantId;
}

export function clearTenantCache() {
  _tenantId = null;
}
