"use client";

import { SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface SignInButtonProps {
  children: React.ReactNode;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

export function ClientSignInButton({ children, size = "lg", className }: SignInButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder while mounting to prevent hydration mismatch
    return (
      <button disabled className={`inline-flex items-center justify-center rounded-md px-8 py-3 text-lg font-medium ${className || ''}`}>
        {children}
      </button>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className={`inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-8 py-3 text-lg font-medium hover:bg-primary/90 ${className || ''}`}>
        {children}
      </button>
    </SignInButton>
  );
}
