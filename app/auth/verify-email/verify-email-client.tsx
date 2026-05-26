"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Invalid or expired verification link. Request a new email below.",
  error: "We could not verify your email. Please try again or request a new link.",
};

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const legacyToken = searchParams.get("token");
  const verified = searchParams.get("verified") === "1";
  const errorCode = searchParams.get("error");
  const emailPending = searchParams.get("emailPending") === "1";

  const emailFromQuery = searchParams.get("email") ?? "";
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (legacyToken) {
      router.replace(`/auth/verify-email/confirm/${legacyToken}`);
    }
  }, [legacyToken, router]);

  async function handleResend() {
    setResendLoading(true);
    setResendMessage("");

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resendEmail }),
    });

    const data = await res.json();
    setResendLoading(false);

    if (!res.ok) {
      setResendMessage(data.error ?? "Could not resend email. Please try again later.");
      return;
    }

    setResendMessage(
      data.message ?? "If an unverified account exists, a new verification link has been sent."
    );
  }

  if (legacyToken) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
        <p className="text-muted">Redirecting to verification...</p>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="success" message="Email verified successfully!" />
        <p className="text-muted text-sm">You can now sign in with your password.</p>
        <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
      </div>
    );
  }

  if (errorCode) {
    return (
      <div className="flex flex-col gap-4">
        <Alert
          type="error"
          message={ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.error}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
        />
        <Button type="button" onClick={handleResend} isLoading={resendLoading}>
          Resend verification email
        </Button>
        {resendMessage && (
          <p className="text-sm text-muted" role="status">
            {resendMessage}
          </p>
        )}
        <Button variant="secondary" onClick={() => router.push("/auth/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {emailPending && (
        <Alert
          type="warning"
          message="Your account was created, but the verification email could not be sent. Use Resend below."
        />
      )}
      <Alert type="warning" message="Please check your email for a verification link." />
      <p className="text-muted text-sm">
        A verification email has been sent to your inbox. Click the link to verify your account.
        Check spam if you do not see it.
      </p>
      <div className="flex flex-col gap-2 border-t border-default pt-4">
        <p className="text-muted text-sm">Did not get the email?</p>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
        />
        <Button type="button" onClick={handleResend} isLoading={resendLoading}>
          Resend verification email
        </Button>
        {resendMessage && (
          <p className="text-sm text-muted" role="status">
            {resendMessage}
          </p>
        )}
      </div>
      <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
    </div>
  );
}
