export const PageHeader = ({ title, subtitle, eyebrow, action, badge }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-cyan)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse" />
              {eyebrow}
            </span>
            {badge && <span>{badge}</span>}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--text-high-contrast)]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
