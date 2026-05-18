/**
 * Sign-out plumbing. Centralized so the cookie call and the cache clear
 * always happen together — leaving stale case/deadline/file/team data in
 * memory after a logout caused flashes of the previous user's data when
 * the next user signed in.
 */

import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { useCaseStore } from "@/stores/case-store";
import { useDeadlineStore } from "@/stores/deadline-store";
import { useFileStore } from "@/stores/file-store";
import { useTeamStore } from "@/stores/team-store";

/**
 * Reset every domain store back to its initial state. Safe to call before
 * any auth-related navigation (sign-out, post-register hand-off). Runs
 * synchronously and never throws.
 */
export function clearClientCache(): void {
  useCaseStore.getState().reset();
  useDeadlineStore.getState().reset();
  useFileStore.getState().reset();
  useTeamStore.getState().reset();
  useAuthStore.getState().logout();

  // Wipe the persisted auth slice from localStorage too — `logout()` writes
  // the cleared state back, but we also want to handle the edge case where
  // persist is mid-rehydrate when the user signs out.
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("casepilot-auth");
    } catch {
      // Best-effort; storage may be unavailable (private mode, quota, etc.).
    }
  }
}

/**
 * Full sign-out: tells the backend to drop the session cookie, then wipes
 * client-side caches. Errors from the API call are swallowed — local state
 * is cleared either way so the UI can never get "stuck" signed in.
 */
export async function signOut(): Promise<void> {
  try {
    await authService.logout();
  } catch {
    // Best-effort — the cookie may already be invalid.
  }
  clearClientCache();
}
