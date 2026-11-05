export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: 'cs-btn cs-btn-primary',
    secondary: 'cs-btn cs-btn-secondary',
    ghost: 'cs-btn cs-btn-ghost',
    danger: 'cs-btn cs-btn-danger',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant] || variants.primary} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
