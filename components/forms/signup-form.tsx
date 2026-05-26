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

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });

    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) {
      if (data.field) {
        setFieldErrors({ [data.field]: data.error });
      } else {
        setError(data.error);
      }
      return;
    }

    if (data.emailSent === false) {
      setError(
        "Account created, but we could not send the verification email. Add a real Resend API key in .env.local, restart the app, and sign up again—or ask your developer to resend."
      );
      return;
    }

    router.push(
      `/auth/verify-email?email=${encodeURIComponent(fields.email)}`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert type="error" message={error} />}

      <Input
        label="Email"
        type="email"
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
