"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Unable to process your request. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Unable to connect. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <Alert
        type="success"
        message="If an account exists, a reset link has been sent."
      />
    );
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Button type="submit" isLoading={isLoading}>
        Send Reset Link
      </Button>
    </form>
  );
}
