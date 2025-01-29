import { useEffect } from 'react';
import { cn } from '../lib/utils';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

export type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  className?: string;
};

export function Toast({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  className 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        type === 'error' && 'bg-destructive/15 text-destructive border border-destructive/20',
        type === 'success' && 'bg-green-500/15 text-green-600 border border-green-500/20',
        type === 'info' && 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
        className
      )}
    >
      {type === 'error' && <AlertCircle className="h-5 w-5" />}
      {type === 'success' && <CheckCircle2 className="h-5 w-5" />}
      {type === 'info' && <AlertCircle className="h-5 w-5" />}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 rounded-full p-1 hover:bg-black/5 transition-colors"
        aria-label="关闭提示"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
} 