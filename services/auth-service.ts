/**
 * Auth service. See `casepilot-api/docs/api.md`.
 *
 * Auth model: better-auth session cookies. The API client sends every
 * request with `withCredentials: true` so the cookie is attached and any
 * Set-Cookie response is stored.
 *
 * Documented endpoints used here:
 *   POST   /auth/register         { name, email, password, barLicenseNumber, nationalNumber }
 *   POST   /auth/login            { email, password }
 *   GET    /auth/me
 *   POST   /auth/logout
 *   POST   /auth/change-password  { oldPassword, newPassword }
 *   PATCH  /users/{userId}        { name?, email? }   (only these two are updatable here)
 */

import type { User, LoginCredentials } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AuthSessionResponse {
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  barLicenseNumber: string;
  nationalNumber: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
}

export const authService = {
  /** POST /auth/login. Backend sets the session cookie. */
  async login(credentials: LoginCredentials): Promise<{ user: User }> {
    const data = await apiClient.post<AuthSessionResponse>(
      "/auth/login",
      credentials
    );
    return { user: data.user };
  },

  /** POST /auth/register. Backend sets the session cookie. */
  async register(payload: RegisterPayload): Promise<{ user: User }> {
    const data = await apiClient.post<AuthSessionResponse>(
      "/auth/register",
      payload
    );
    return { user: data.user };
  },

  /** GET /auth/me. Reads the current session. */
  async me(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  /** PATCH /users/{userId}. The endpoint only accepts name + email per
   *  the API docs; bar/national/avatar live on the registration record
   *  and are not editable through this route. */
  async updateProfile(
    userId: string,
    payload: UpdateProfilePayload
  ): Promise<User> {
    return apiClient.patch<User>(`/users/${userId}`, payload);
  },

  /** POST /auth/change-password. Session cookie identifies the user. */
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post("/auth/change-password", payload);
  },

  /** POST /auth/logout. Backend clears the session cookie. */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Best-effort; the client always clears local state regardless.
    }
  },
};
