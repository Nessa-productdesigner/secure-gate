import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, children, className = "", disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface-primary)] disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] focus:ring-[var(--brand-primary)]",
      secondary: "border border-default text-heading hover:bg-[var(--surface-foreground-1)] focus:ring-default",
      ghost: "text-muted hover:text-heading hover:bg-[var(--surface-foreground-1)]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? <Spinner className="-ml-1 mr-2 h-4 w-4" aria-hidden /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
