"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: fields.email,
      password: fields.password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={fields.password}
        onChange={(e) => setFields({ ...fields, password: e.target.value })}
        required
      />

      <Button type="submit" isLoading={isLoading}>
        Sign In
      </Button>
    </form>
  );
}
