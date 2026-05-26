"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PasswordStrength } from "@/components/ui/password-strength";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }

      if (!res.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          setError(data.error ?? "Could not reset your password. Please request a new link.");
        }
        return;
      }

      router.push("/auth/login");
    } catch {
      setError("Unable to connect. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <Alert type="error" message="Invalid reset link. Please request a new one." />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && <Alert type="error" message={error} />}

      <div className="flex flex-col gap-1">
        <Input
          label="New Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <PasswordStrength password={password} />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Reset Password
      </Button>
    </form>
  );
}
