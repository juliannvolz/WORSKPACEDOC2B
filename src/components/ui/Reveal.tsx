"use client";

import { cn } from "@/lib/utils";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export function Reveal({ children, className, duration = 500 }: RevealProps) {
  const animationDuration = `${duration}ms`;

  return (
    <div
      className={cn(
        "overflow-hidden",
        className,
      )}
      style={{
        animationDuration,
      }}
    >
      {children}
    </div>
  );
}