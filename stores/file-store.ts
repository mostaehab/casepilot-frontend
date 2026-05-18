import { create } from "zustand";
import type { CaseFile } from "@/types";
import { fileService } from "@/services/file-service";

interface FileState {
  files: CaseFile[];
  isLoading: boolean;
  error: string | null;

  fetchFiles: (caseId: string) => Promise<void>;
  uploadFile: (caseId: string, file: File) => Promise<void>;
  deleteFile: (caseId: string, fileId: string) => Promise<void>;
  /** Drop all in-memory file state. Called on sign-out. */
  reset: () => void;
}

const initialFileState = {
  files: [] as CaseFile[],
  isLoading: false,
  error: null as string | null,
};

export const useFileStore = create<FileState>()((set) => ({
  ...initialFileState,

  reset: () => set(initialFileState),

  fetchFiles: async (caseId) => {
    set({ isLoading: true, error: null });
    try {
      const files = await fileService.listFiles(caseId);
      set({ files, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load files",
        isLoading: false,
      });
    }
  },

  uploadFile: async (caseId, file) => {
    const created = await fileService.uploadFile(caseId, file);
    set((state) => ({ files: [created, ...state.files] }));
  },

  deleteFile: async (caseId, fileId) => {
    await fileService.deleteFile(caseId, fileId);
    set((state) => ({ files: state.files.filter((f) => f.id !== fileId) }));
  },
}));
