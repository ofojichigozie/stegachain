/**
 * Central notification utility.
 *
 * All user-facing feedback is channelled through this module so that the
 * notification library (Sonner) is only coupled in one place. Swap the
 * implementation here without touching any hook or component.
 */

import { toast } from "sonner";

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, { description });
  },

  /** Accepts an Error or a plain string as the second argument. */
  error(message: string, err?: unknown) {
    const description =
      err instanceof Error ? err.message : typeof err === "string" ? err : undefined;
    toast.error(message, { description });
  },

  info(message: string, description?: string) {
    toast.info(message, { description });
  },

  /** Warning — operation succeeded but with a caveat. */
  warning(message: string, description?: string) {
    toast.warning(message, { description });
  },

  /** Long-running async operation with a promise. */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    }
  ) {
    return toast.promise(promise, messages);
  },

  dismissAll() {
    toast.dismiss();
  },
} as const;
