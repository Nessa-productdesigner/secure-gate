"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { PasswordStrength } from "@/components/ui/password-strength";

export function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [fields, setFields] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    const email = fields.email.trim().toLowerCase();

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: fields.password }),
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
          setError(data.error ?? "Unable to create your account. Please try again.");
        }
        return;
      }

      if (data.emailSent === false) {
        router.push(
          `/auth/verify-email?email=${encodeURIComponent(email)}&emailPending=1`
        );
        return;
      }

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Unable to connect. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error && <Alert type="error" message={error} />}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={fields.email}
        onChange={(e) => setFields({ ...fields, email: e.target.value })}
        error={fieldErrors.email}
        required
      />

      <div className="flex flex-col gap-1">
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={fields.password}
          onChange={(e) => setFields({ ...fields, password: e.target.value })}
          error={fieldErrors.password}
          required
        />
        <PasswordStrength password={fields.password} />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Create Account
      </Button>
    </form>
  );
}
