"use client";

import { cn } from "@/lib/utils";

export interface CTAButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  large?: boolean;
  onClick?: () => void;
}

export function CTAButton({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  type = "button", 
  disabled = false, 
  ...props 
}: CTAButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    primary: "bg-neon text-bone hover:bg-bone/20",
    secondary: "bg-bone/20 text-bone hover:bg-bone",
    outline: "border-2 border-bone text-bone hover:bg-bone/20",
  };
  const sizeClasses = {
    sm: "h-8 px-3 py-1",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 py-3",
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}