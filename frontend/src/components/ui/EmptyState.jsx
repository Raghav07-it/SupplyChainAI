import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ message, description, actionLabel, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--surface-base)]/50">
      <div className="w-12 h-12 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--text-secondary)] mb-3">
        {icon || <PackageOpen size={24} />}
      </div>
      <p className="text-sm font-semibold text-[var(--text-high-contrast)] mb-1">
        {message || 'No records found'}
      </p>
      {description && (
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="cs-btn cs-btn-primary text-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
