import { toast } from "sonner";

import { ApiError, ApiErrorType } from "@orbit/http-client";

import { useErrorDialogStore } from "./error-dialog.store";

export class ErrorManager {
  static handle(error: unknown): void {
    console.error("[ERROR MANAGER]", error);

    if (!(error instanceof ApiError)) {
      this.showDialog(
        "Unexpected Error",
        "An unexpected application error occurred.",
      );

      return;
    }

    switch (error.type) {
      case ApiErrorType.CLIENT: {
        toast.error(error.message);
        return;
      }

      case ApiErrorType.NETWORK: {
        this.showDialog("Network Error", error.message);

        return;
      }

      case ApiErrorType.TIMEOUT: {
        this.showDialog("Request Timed Out", error.message);

        return;
      }

      case ApiErrorType.SERVER: {
        this.showDialog("Server Error", error.message);

        return;
      }

      case ApiErrorType.CANCELED: {
        /**
         * Usually ignore cancelled requests.
         */
        return;
      }

      case ApiErrorType.UNKNOWN:
      default: {
        this.showDialog("Unexpected Error", error.message);
      }
    }
  }

  private static showDialog(title: string, message: string) {
    useErrorDialogStore.getState().show(title, message);
  }
}
