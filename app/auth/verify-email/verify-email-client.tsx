"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(rawToken ? "loading" : "idle");
  const [message, setMessage] = useState("");

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

  return (
    <>
      {status === "idle" && (
        <div className="flex flex-col gap-4">
          <Alert type="warning" message="Please check your email for a verification link." />
          <p className="text-[#9CA3AF] text-sm">
            A verification email has been sent to your inbox. Click the link to verify your account.
          </p>
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
          <Button onClick={() => router.push("/auth/forgot-password")}>
            Request New Verification
          </Button>
        </div>
      )}
    </>
  );
}
