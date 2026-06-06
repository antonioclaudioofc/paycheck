import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const baseStyle =
    "py-3 px-4 rounded-md font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none text-sm";

  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-98",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-border active:scale-98",
    danger:
      "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:brightness-110 active:scale-98",
    ghost:
      "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-98",
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyle} ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export default Button;
