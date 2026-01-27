import React, { createContext, useContext, useState, ReactNode } from 'react';

type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };

type ToastContextValue = {
  toasts: Toast[];
  push: (t: Omit<Toast, 'id'>) => void;
  remove: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = (t: Omit<Toast, 'id'>) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 8);
    const toast: Toast = { id, ...t };
    setToasts((s) => [toast, ...s]);
    // Auto-remove after 4.5s
    setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), 4500);
  };

  const remove = (id: string) => setToasts((s) => s.filter(t => t.id !== id));

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    push({ message, type });
  };

  return (
    <ToastContext.Provider value={{ toasts, push, remove, showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;
