"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function VerifyEmailConfirmClient({ token }: { token: string }) {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          router.replace("/auth/verify-email?verified=1");
          return;
        }
        const code = res.status === 400 ? "invalid" : "error";
        router.replace(`/auth/verify-email?error=${code}`);
      })
      .catch(() => {
        router.replace("/auth/verify-email?error=error");
      });
  }, [token, router]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      <p className="text-muted">Verifying your email...</p>
    </div>
  );
}
