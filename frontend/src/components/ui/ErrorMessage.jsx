import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-[var(--status-critical-bg)] border border-[var(--status-critical-border)] text-[var(--status-critical)] rounded-lg p-3.5 flex items-start justify-between gap-3 text-xs">
    <div className="flex items-center gap-2">
      <AlertCircle size={16} className="shrink-0" />
      <span>{message || 'An unexpected error occurred.'}</span>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="underline font-semibold hover:opacity-80 shrink-0"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorMessage;
