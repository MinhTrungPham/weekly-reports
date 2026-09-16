function IconButton({ children, label, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} type="button" aria-label={label} {...props}>
      {children}
    </button>
  );
}

export default IconButton;
