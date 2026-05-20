import { toast as sonnerToast } from 'sonner';

export const toast = Object.assign(
  (msg: string) => sonnerToast(msg),
  {
    success: (msg: string) => sonnerToast.success(msg),
    error:   (msg: string) => sonnerToast.error(msg),
    warning: (msg: string) => sonnerToast.warning(msg),
    info:    (msg: string) => sonnerToast.info(msg),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
);
