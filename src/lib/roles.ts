import type { Profile } from "@/lib/supabase/database.types";

export type Role = Profile["role"];

export const ROLES: Role[] = ["owner", "co-owner", "devs", "member"];

export function canInvite(role: Role): boolean {
  return role === "owner" || role === "co-owner" || role === "devs";
}

export function canModerate(role: Role): boolean {
  return role === "owner" || role === "co-owner";
}

export function isStaff(role: Role): boolean {
  return role !== "member";
}
