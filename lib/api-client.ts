/**
 * Axios-based API client for the CasePilot backend.
 *
 * Auth: backend uses better-auth which sets/reads HTTP cookies. We send all
 * requests with `withCredentials: true` so the browser includes the session
 * cookie automatically and any Set-Cookie response headers are stored.
 *
 * Wire format (per `casepilot-api/docs/api.md`):
 *   - **Request bodies are camelCase.** Service callers pass camelCase
 *     keys; we send them through unchanged.
 *   - **Response bodies are mostly snake_case** (case_number, owner_id,
 *     team_id, ...). We deep-camelCase responses after unwrapping the
 *     envelope so consumers always see camelCase.
 *
 * For field names that genuinely diverge between API and frontend
 * (`type` vs `caseType`, `owner_id` vs `createdBy`, `team_id` vs `firmId`),
 * the per-domain service files perform an additional explicit rename.
 *
 * Backend response shape:
 *   Success: { status: "success", data: T }
 *   Error:   { error?: string, message?: string }
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  data: T;
}

interface ApiErrorBody {
  error?: string;
  message?: string;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiEnvelope<unknown>>) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const message =
      body?.error || body?.message || error.message || "Request failed";

    if (process.env.NODE_ENV !== "production") {
      logRequestDiagnostics(error);
    }

    return Promise.reject(new ApiError(message, status));
  }
);

function logRequestDiagnostics(error: AxiosError<ApiErrorBody>): void {
  if (typeof window === "undefined") return;

  const status = error.response?.status ?? 0;
  const url = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;
  const method = error.config?.method?.toUpperCase() ?? "GET";

  const corsHeader = error.response?.headers?.["access-control-allow-credentials"];
  const corsOrigin = error.response?.headers?.["access-control-allow-origin"];
  const setCookie = error.response?.headers?.["set-cookie"];
  const cookiesVisible = document.cookie || "(no cookies visible to JS)";

  /* eslint-disable no-console */
  console.groupCollapsed(
    `%c[API ${status}] %c${method} ${url}`,
    "color:#dc2626;font-weight:bold",
    "color:#64748b"
  );
  console.log("Message:", error.message);
  console.log("Body:", error.response?.data);

  if (status === 401 || status === 403) {
    console.log(
      "Tip: better-auth uses an HTTP-only session cookie. The browser hides it from JS. Check the Network tab for `Cookie` on this request."
    );
  }

  console.log("Document.cookie (non-httpOnly only):", cookiesVisible);
  console.log("Access-Control-Allow-Credentials:", corsHeader ?? "(missing)");
  console.log("Access-Control-Allow-Origin:", corsOrigin ?? "(missing)");
  console.log("Set-Cookie (response):", setCookie ?? "(none)");

  if (corsHeader !== "true") {
    console.warn(
      "Backend should return `Access-Control-Allow-Credentials: true` for cookies to be sent cross-origin."
    );
  }
  if (corsOrigin === "*") {
    console.warn(
      "CORS origin cannot be `*` when sending credentials. Backend must echo the exact frontend origin."
    );
  }
  console.groupEnd();
  /* eslint-enable no-console */
}

/* ------------------------------------------------------------------
   Response camel-casing. The API returns snake_case in most response
   shapes; we camel-case once at the boundary so the rest of the app
   only ever sees camelCase. Request bodies are sent through unchanged
   because the API expects camelCase on the wire (see top-of-file).
   ------------------------------------------------------------------ */

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function deepCamelize<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((v) => deepCamelize<unknown>(v)) as unknown as T;
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[snakeToCamel(k)] = deepCamelize(v);
    }
    return out as T;
  }
  return value as T;
}

function unwrap<T>(response: AxiosResponse<ApiEnvelope<unknown>>): T {
  return deepCamelize<T>(response.data?.data);
}

export const apiClient = {
  get: async <T>(path: string, config?: Parameters<AxiosInstance["get"]>[1]) =>
    unwrap<T>(await axiosInstance.get<ApiEnvelope<unknown>>(path, config)),

  post: async <T>(
    path: string,
    body?: unknown,
    config?: Parameters<AxiosInstance["post"]>[2]
  ) =>
    unwrap<T>(
      await axiosInstance.post<ApiEnvelope<unknown>>(path, body, config)
    ),

  put: async <T>(
    path: string,
    body?: unknown,
    config?: Parameters<AxiosInstance["put"]>[2]
  ) =>
    unwrap<T>(
      await axiosInstance.put<ApiEnvelope<unknown>>(path, body, config)
    ),

  patch: async <T>(
    path: string,
    body?: unknown,
    config?: Parameters<AxiosInstance["patch"]>[2]
  ) =>
    unwrap<T>(
      await axiosInstance.patch<ApiEnvelope<unknown>>(path, body, config)
    ),

  delete: async <T>(path: string, config?: Parameters<AxiosInstance["delete"]>[1]) =>
    unwrap<T>(await axiosInstance.delete<ApiEnvelope<unknown>>(path, config)),
};

export { ApiError, axiosInstance, deepCamelize };
