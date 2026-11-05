export const LoadingSpinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col justify-center items-center py-10 gap-2">
    <div className="w-7 h-7 border-2 border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
    {label && <p className="text-xs text-[var(--text-secondary)]">{label}</p>}
  </div>
);

export default LoadingSpinner;
