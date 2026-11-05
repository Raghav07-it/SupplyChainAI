export const PageHeader = ({ title, subtitle, eyebrow, action, badge }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-cyan)]">
              {eyebrow}
            </span>
            {badge && <span>{badge}</span>}
          </div>
        )}
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-high-contrast)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
