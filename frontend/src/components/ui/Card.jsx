export const Card = ({ children, className = '', active = false, ...props }) => {
  return (
    <div
      className={`${active ? 'cs-card-active' : 'cs-card'} p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
