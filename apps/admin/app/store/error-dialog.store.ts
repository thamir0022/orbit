// shared/error/error-dialog.store.ts

import { create } from "zustand";

interface ErrorDialogState {
  open: boolean;
  title: string;
  message: string;

  show(title: string, message: string): void;

  close(): void;
}

export const useErrorDialogStore = create<ErrorDialogState>((set) => ({
  open: false,
  title: "",
  message: "",

  show(title, message) {
    set({
      open: true,
      title,
      message,
    });
  },

  close() {
    set({
      open: false,
      title: "",
      message: "",
    });
  },
}));
