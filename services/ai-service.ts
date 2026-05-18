/**
 * AI case analysis service.
 *
 * Endpoints (see `docs/ai-case-analysis.md`):
 *   POST /cases/{caseId}/ai/analyze              run a new analysis
 *   GET  /cases/{caseId}/ai/analyses             list past runs (newest first)
 *   GET  /cases/{caseId}/ai/analyses/{id}        fetch one
 *
 * The analyze call is synchronous server-side (Sonnet 4.6 via Vercel AI
 * Gateway) and may take 10–60s. Callers should pass an AbortSignal and
 * surface a spinner while waiting.
 */

import type { AnalyzeCaseRequest, CaseAnalysis } from "@/types";
import { apiClient } from "@/lib/api-client";

export const aiService = {
  async analyzeCase(
    caseId: string,
    body: AnalyzeCaseRequest = {},
    signal?: AbortSignal,
  ): Promise<CaseAnalysis> {
    return apiClient.post<CaseAnalysis>(
      `/cases/${caseId}/ai/analyze`,
      body,
      { signal },
    );
  },

  async listAnalyses(caseId: string): Promise<CaseAnalysis[]> {
    return apiClient.get<CaseAnalysis[]>(`/cases/${caseId}/ai/analyses`);
  },

  async getAnalysis(
    caseId: string,
    analysisId: string,
  ): Promise<CaseAnalysis> {
    return apiClient.get<CaseAnalysis>(
      `/cases/${caseId}/ai/analyses/${analysisId}`,
    );
  },
};
