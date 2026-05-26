"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/auth/login" });
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleSignOut}
      isLoading={isLoading}
      className="flex items-center justify-center gap-2 w-auto px-6"
    >
      <LogOut size={16} aria-hidden />
      <span>Sign Out</span>
    </Button>
  );
}
