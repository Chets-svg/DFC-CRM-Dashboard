// src/hooks/use-toast.ts
import { createContext, useContext } from 'react';

type Toast = {
  title?: string;
  description?: string;
};

type ToastContextType = {
  toast: (opts: Toast) => void;
};

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);