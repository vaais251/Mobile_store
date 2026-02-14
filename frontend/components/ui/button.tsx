import React from "react";
import { cn } from "@/lib/utils";

/* ─── Variant Definitions ─────────────────── */
const variantStyles = {
    default:
        "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm",
    outline:
        "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100",
    ghost:
        "text-secondary-700 hover:bg-secondary-300/50 active:bg-secondary-300",
    danger:
        "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-sm",
    success:
        "bg-success-500 text-white hover:bg-success-700 active:bg-success-700 shadow-sm",
} as const;

const sizeStyles = {
    sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
    md: "h-10 px-5 text-sm rounded-xl gap-2",
    lg: "h-12 px-6 text-base rounded-xl gap-2.5",
    xl: "h-14 px-8 text-lg rounded-2xl gap-3",
} as const;

/* ─── Types ───────────────────────────────── */
export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variantStyles;
    size?: keyof typeof sizeStyles;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

/* ─── Component ───────────────────────────── */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "default",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(
                    // Base styles
                    "inline-flex items-center justify-center font-medium",
                    "transition-all duration-200 ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "active:scale-[0.98]",
                    // Variant + Size
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                {...props}
            >
                {/* Loading spinner */}
                {isLoading && (
                    <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}

                {/* Left icon */}
                {!isLoading && leftIcon && (
                    <span className="shrink-0">{leftIcon}</span>
                )}

                {children}

                {/* Right icon */}
                {rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";
