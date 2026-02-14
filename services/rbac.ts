import { UserRole } from "../types";

export type Permission =
  | "view_dashboard"
  | "manage_cases"
  | "manage_clients"
  | "manage_documents"
  | "manage_reminders"
  | "manage_accounting"
  | "manage_settings"
  | "view_ai";

const ROLE_PERMS: Record<UserRole, Set<Permission>> = {
  ADMIN: new Set([
    "view_dashboard",
    "manage_cases",
    "manage_clients",
    "manage_documents",
    "manage_reminders",
    "manage_accounting",
    "manage_settings",
    "view_ai",
  ]),
  ASSISTANT: new Set([
    "view_dashboard",
    "manage_cases",
    "manage_clients",
    "manage_documents",
    "manage_reminders",
    "view_ai",
  ]),
  ACCOUNTANT: new Set([
    "view_dashboard",
    "manage_clients",
    "manage_accounting",
    "manage_documents",
    "manage_reminders",
  ]),
};

export function hasPerm(role: UserRole | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMS[role]?.has(perm) ?? false;
}
