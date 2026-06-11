export type ToastType = "success" | "error" | "info";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ToastFn = (message: string, type?: ToastType) => void;
type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

let toastFn: ToastFn = (message) => {
  if (typeof window !== "undefined") console.info(message);
};
let confirmFn: ConfirmFn = async () => false;

export function registerToast(fn: ToastFn): void {
  toastFn = fn;
}

export function registerConfirm(fn: ConfirmFn): void {
  confirmFn = fn;
}

export function toast(message: string, type: ToastType = "info"): void {
  toastFn(message, type);
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return confirmFn(options);
}
