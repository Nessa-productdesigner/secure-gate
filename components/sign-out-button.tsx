"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/auth/login" })}
      className="flex items-center justify-center gap-2 w-auto px-6"
    >
      <LogOut size={16} />
      <span>Sign Out</span>
    </Button>
  );
}
