export const StatCard = ({ title, value, subtitle, icon, color = 'cyan', badge }) => {
  const colorMap = {
    cyan: 'text-[var(--accent-cyan)]',
    green: 'text-[var(--status-success)]',
    purple: 'text-[var(--accent-purple)]',
    amber: 'text-[var(--status-warning)]',
    red: 'text-[var(--status-critical)]',
    blue: 'text-[var(--accent-primary-light)]',
  };

  const bgMap = {
    cyan: 'bg-[var(--accent-cyan-bg)] border-[rgba(6,182,212,0.25)]',
    green: 'bg-[var(--status-success-bg)] border-[var(--status-success-border)]',
    purple: 'bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.25)]',
    amber: 'bg-[var(--status-warning-bg)] border-[var(--status-warning-border)]',
    red: 'bg-[var(--status-critical-bg)] border-[var(--status-critical-border)]',
    blue: 'bg-[var(--accent-primary-bg)] border-[rgba(99,102,241,0.25)]',
  };

  return (
    <div className="cs-card p-5 flex items-center justify-between">
      <div className="min-w-0 flex-1 pr-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide truncate">
            {title}
          </p>
          {badge && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              {badge}
            </span>
          )}
        </div>
        <p className={`text-2xl lg:text-3xl font-bold mt-1.5 ${colorMap[color] || colorMap.cyan}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs mt-1 text-[var(--text-secondary)] truncate">
            {subtitle}
          </p>
        )}
      </div>
      {icon && (
        <div
          className={`w-11 h-11 rounded-lg border flex items-center justify-center shrink-0 ${
            bgMap[color] || bgMap.cyan
          }`}
        >
          <span className={colorMap[color] || colorMap.cyan}>{icon}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
