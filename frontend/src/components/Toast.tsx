import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 flex max-w-sm items-start gap-3 rounded-lg border border-red-500 bg-slate-900/90 p-4 text-sm text-red-200 shadow-lg">
      <span>{message}</span>
      <button
        type="button"
        className="ml-auto text-xs font-semibold uppercase tracking-wide text-red-300 hover:text-red-100"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
