"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const emailFromQuery = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(rawToken ? "loading" : "idle");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(emailFromQuery);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!rawToken) return;

    router.replace("/auth/verify-email");

    setStatus("loading");

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: rawToken }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong");
      });
  }, [rawToken, router]);

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
      setResendMessage(data.error ?? "Could not resend email.");
      return;
    }

    setResendMessage(data.message ?? "Verification email sent. Check your inbox and spam folder.");
  }

  return (
    <>
      {status === "idle" && (
        <div className="flex flex-col gap-4">
          <Alert type="warning" message="Please check your email for a verification link." />
          <p className="text-[#9CA3AF] text-sm">
            A verification email has been sent to your inbox. Click the link to verify your account.
            Check spam if you do not see it.
          </p>
          <div className="flex flex-col gap-2 border-t border-[#1F2937] pt-4">
            <p className="text-[#9CA3AF] text-sm">Did not get the email?</p>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10 px-3 rounded-lg border border-[#1F2937] bg-[#111827] text-[#F9FAFB] text-sm"
              aria-label="Email address"
            />
            <Button type="button" onClick={handleResend} isLoading={resendLoading}>
              Resend verification email
            </Button>
            {resendMessage && (
              <p className="text-sm text-[#9CA3AF]" role="status">
                {resendMessage}
              </p>
            )}
          </div>
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
          <p className="text-[#9CA3AF]">Verifying your email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col gap-4">
          <Alert type="success" message={message} />
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-4">
          <Alert type="error" message={message} />
          <Button onClick={() => router.push("/auth/verify-email")}>
            Back to verification help
          </Button>
        </div>
      )}
    </>
  );
}
