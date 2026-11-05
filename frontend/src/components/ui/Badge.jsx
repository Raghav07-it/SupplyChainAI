export const Badge = ({ variant = 'default', children, className = '', ...props }) => {
  const variants = {
    default: 'cs-pill',
    cyan: 'cs-pill cs-pill-cyan',
    green: 'cs-pill cs-pill-green',
    amber: 'cs-pill cs-pill-amber',
    red: 'cs-pill cs-pill-red',
    blue: 'cs-pill cs-pill-blue',
  };

  return (
    <span className={`${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
