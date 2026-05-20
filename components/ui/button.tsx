import { ButtonHTMLAttributes, forwardRef } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, children, className = "", disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-[#2563EB] text-white hover:bg-[#1d4ed8] focus:ring-[#2563EB]",
      secondary: "border border-[#1F2937] text-[#F9FAFB] hover:bg-[#1F2937] focus:ring-[#1F2937]",
      ghost: "text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937]",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner className="-ml-1 mr-2 h-4 w-4" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
