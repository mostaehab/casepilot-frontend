import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyzeCaseRequest, CaseAnalysis } from "@/types";
import { aiService } from "@/services/ai-service";

export type AnalyzeState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "success"; analysis: CaseAnalysis }
  | { status: "error"; message: string };

export interface UseCaseAnalysis {
  state: AnalyzeState;
  history: CaseAnalysis[];
  isHistoryLoading: boolean;
  run: (body?: AnalyzeCaseRequest) => Promise<CaseAnalysis | null>;
  cancel: () => void;
  select: (analysis: CaseAnalysis) => void;
  reset: () => void;
}

/**
 * Fetches the most recent analysis for the case on mount, exposes a `run`
 * to trigger a fresh analysis, and keeps the past-runs list in sync.
 */
export function useCaseAnalysis(caseId: string | undefined): UseCaseAnalysis {
  const [state, setState] = useState<AnalyzeState>({ status: "idle" });
  const [history, setHistory] = useState<CaseAnalysis[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;
    setIsHistoryLoading(true);
    aiService
      .listAnalyses(caseId)
      .then((rows) => {
        if (cancelled) return;
        setHistory(rows);
        const latest = rows.find((r) => r.status === "completed");
        if (latest) {
          setState({ status: "success", analysis: latest });
        }
      })
      .catch(() => {
        // 403/404/etc — leave state idle, history empty.
      })
      .finally(() => {
        if (!cancelled) setIsHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const run = useCallback(
    async (body: AnalyzeCaseRequest = {}): Promise<CaseAnalysis | null> => {
      if (!caseId) return null;
      controllerRef.current?.abort();
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      setState({ status: "running" });
      try {
        const analysis = await aiService.analyzeCase(caseId, body, ctrl.signal);
        setState({ status: "success", analysis });
        setHistory((prev) => [analysis, ...prev]);
        return analysis;
      } catch (err) {
        const e = err as { name?: string; message?: string };
        if (e?.name === "AbortError" || e?.name === "CanceledError") {
          setState({ status: "idle" });
          return null;
        }
        setState({
          status: "error",
          message: e?.message ?? "Couldn't analyze the case. Please try again.",
        });
        return null;
      } finally {
        controllerRef.current = null;
      }
    },
    [caseId],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const select = useCallback((analysis: CaseAnalysis) => {
    setState({ status: "success", analysis });
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, history, isHistoryLoading, run, cancel, select, reset };
}
