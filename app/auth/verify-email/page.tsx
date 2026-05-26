import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-default p-8 text-center">
          <h1 className="text-2xl font-bold text-heading mb-6">Email Verification</h1>
          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
                <p className="text-muted">Loading...</p>
              </div>
            }
          >
            <VerifyEmailClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
