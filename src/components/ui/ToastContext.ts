import { createContext, useContext } from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastInput {
  title: string;
  message?: string;
  tone?: ToastTone;
}

export interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
