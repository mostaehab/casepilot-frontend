/**
 * Case file service.
 *
 * Uploads go through our API as multipart/form-data — the browser POSTs the
 * file to `/cases/{caseId}/files`, and the API streams it to Vercel Blob and
 * inserts the DB row in one shot. This avoids the CORS-masked 400s you get
 * when uploading directly to `vercel.com/api/blob`: that endpoint omits
 * `Access-Control-Allow-Origin` on error responses, so the browser hides
 * the real error from JS.
 *
 * Endpoints (see `docs/case-file-uploads.md`):
 *   POST   /cases/{caseId}/files            multipart upload (returns CaseFile)
 *   GET    /cases/{caseId}/files            list
 *   DELETE /cases/{caseId}/files/{fileId}   remove
 *
 * Upload uses XMLHttpRequest (not fetch) so we get `upload.onprogress` events
 * for a progress bar and `xhr.abort()` for cancellation. Both `apiClient` and
 * the XHR send `withCredentials: true` so the better-auth session cookie
 * rides along cross-origin.
 *
 * Wire format: the API responds with snake_case (`file_name`, `file_url`, ...);
 * `deepCamelize` from the api-client converts it before we hand back CaseFile.
 */

import type { CaseFile } from "@/types";
import { ApiError, apiClient, axiosInstance, deepCamelize } from "@/lib/api-client";

/**
 * Absolute URL for the API's download endpoint. The blob store is private —
 * `fileUrl` from the list response is NOT directly fetchable from the
 * browser. All `<img>`, `<iframe>`, `<a>`, and `fetch` references to a
 * case file must go through this helper instead. See
 * `casepilot-api/docs/case-file-uploads.md` §8.
 *
 * @param forceDownload  Append `?download=1` to trigger a save dialog
 *                       instead of inline rendering. Default: inline.
 */
export function downloadUrl(
  caseId: string,
  fileId: string,
  forceDownload = false
): string {
  const base = axiosInstance.defaults.baseURL ?? "";
  const qs = forceDownload ? "?download=1" : "";
  return `${base}/cases/${caseId}/files/${fileId}/download${qs}`;
}

interface ApiErrorBody {
  status?: string;
  error?: string;
  message?: string;
}

interface ApiSuccessBody<T> {
  status: "success";
  data: T;
}

export const fileService = {
  /** GET /cases/{caseId}/files */
  async listFiles(caseId: string): Promise<CaseFile[]> {
    return apiClient.get<CaseFile[]>(`/cases/${caseId}/files`);
  },

  /**
   * POST /cases/{caseId}/files
   *
   * Streams `file` to the API as multipart/form-data. Resolves with the
   * created CaseFile (already camelCased). Pass `opts.signal` to cancel
   * mid-flight; pass `opts.onProgress` for byte-level progress (0-100).
   *
   * Throws ApiError on non-2xx — the API's `{ status, message }` envelope
   * is surfaced as `error.message` and the HTTP status as `error.status`.
   */
  async uploadFile(
    caseId: string,
    file: File,
    opts: {
      onProgress?: (percent: number) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<CaseFile> {
    if (opts.signal?.aborted) {
      throw new DOMException("Upload aborted", "AbortError");
    }

    const baseURL = axiosInstance.defaults.baseURL ?? "";
    const url = `${baseURL}/cases/${caseId}/files`;

    return new Promise<CaseFile>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.withCredentials = true;

      if (opts.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            opts.onProgress!(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        let body: ApiSuccessBody<unknown> | ApiErrorBody | null = null;
        try {
          body = JSON.parse(xhr.responseText) as
            | ApiSuccessBody<unknown>
            | ApiErrorBody;
        } catch {
          body = null;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          const data = (body as ApiSuccessBody<unknown> | null)?.data;
          resolve(deepCamelize<CaseFile>(data));
          return;
        }

        const message =
          (body as ApiErrorBody | null)?.message ||
          (body as ApiErrorBody | null)?.error ||
          `Upload failed (${xhr.status})`;
        reject(new ApiError(message, xhr.status));
      };

      xhr.onerror = () =>
        reject(new ApiError("Network error during upload", 0));
      xhr.onabort = () =>
        reject(new DOMException("Upload aborted", "AbortError"));

      if (opts.signal) {
        opts.signal.addEventListener(
          "abort",
          () => {
            try {
              xhr.abort();
            } catch {
              // already finished — nothing to abort
            }
          },
          { once: true }
        );
      }

      const form = new FormData();
      form.append("file", file);
      xhr.send(form);
    });
  },

  /** DELETE /cases/{caseId}/files/{fileId} */
  async deleteFile(caseId: string, fileId: string): Promise<void> {
    await apiClient.delete(`/cases/${caseId}/files/${fileId}`);
  },
};
