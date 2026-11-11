import { PackageOpen } from "lucide-react";

export const EmptyState = ({
  title,
  message,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  const displayTitle = title || message || "No records found";

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--surface-base)]/60">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary-light)] mb-4 shadow-inner">
        {icon || <PackageOpen size={28} />}
      </div>
      <h3 className="text-lg font-bold text-[var(--text-high-contrast)] mb-1.5">
        {displayTitle}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="cs-btn cs-btn-primary text-sm px-5 py-2.5 font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
