'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  X, 
  Check 
} from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalOptions {
  title?: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

interface ConfirmModalOptions {
  title?: string;
  message: string;
  type?: AlertType | 'danger';
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (options: AlertModalOptions | string) => Promise<void>;
  showConfirm: (options: ConfirmModalOptions) => Promise<boolean>;
  showToast: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: AlertType;
    isConfirm: boolean;
    confirmText: string;
    cancelText: string;
    destructive: boolean;
    resolve: (value: boolean) => void;
  } | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: AlertType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showAlert = useCallback((options: AlertModalOptions | string): Promise<void> => {
    const config: AlertModalOptions = typeof options === 'string' 
      ? { message: options } 
      : options;

    return new Promise((resolve) => {
      setModalConfig({
        title: config.title || (config.type === 'error' ? 'Terjadi Kesalahan' : config.type === 'success' ? 'Berhasil' : 'Pemberitahuan'),
        message: config.message,
        type: config.type || 'info',
        isConfirm: false,
        confirmText: config.confirmText || 'OK, Mengerti',
        cancelText: '',
        destructive: false,
        resolve: () => resolve(),
      });
      setModalOpen(true);
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmModalOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalConfig({
        title: options.title || 'Konfirmasi Tindakan',
        message: options.message,
        type: options.type === 'danger' ? 'error' : (options.type || 'warning'),
        isConfirm: true,
        confirmText: options.confirmText || 'Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        destructive: options.destructive ?? (options.type === 'danger'),
        resolve,
      });
      setModalOpen(true);
    });
  }, []);

  const handleConfirmClose = (result: boolean) => {
    setModalOpen(false);
    if (modalConfig) {
      modalConfig.resolve(result);
      setModalConfig(null);
    }
  };

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      default:
        return <Info className="w-6 h-6 text-[#7A4B29]" />;
    }
  };

  const getIconBg = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-rose-50 border-rose-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-[#F5EFEB] border-[#E8DEC8]';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm, showToast }}>
      {children}

      {/* Custom Modal Alert / Confirm */}
      {modalOpen && modalConfig && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md bg-[#FFFDF9] border border-[#E8DEC8] rounded-2xl shadow-2xl p-5 md:p-6 animate-in zoom-in-95 duration-200 flex flex-col gap-4 text-left"
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl border shrink-0 ${getIconBg(modalConfig.type)}`}>
                {getIcon(modalConfig.type)}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-bold text-base text-[#3E271B] leading-tight">
                  {modalConfig.title}
                </h3>
                <p className="mt-1.5 text-xs md:text-sm text-[#5A3E2C] leading-relaxed whitespace-pre-line">
                  {modalConfig.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#F0E6D8]">
              {modalConfig.isConfirm && (
                <button
                  type="button"
                  onClick={() => handleConfirmClose(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A3E2C] hover:text-[#3E271B] hover:bg-[#F3ECE0] rounded-xl border border-[#DCCBB8] transition"
                >
                  {modalConfig.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm transition ${
                  modalConfig.destructive
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#6B4226] hover:bg-[#54331C]'
                }`}
              >
                {modalConfig.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-100 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-700'
                : 'bg-[#2D1E16]/95 text-[#F5EFEB] border-[#4A2E1B]'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/60 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
