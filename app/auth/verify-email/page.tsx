import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8 text-center">
          <h1 className="text-2xl font-bold text-[#F9FAFB] mb-6">Email Verification</h1>
          <Suspense fallback={
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
              <p className="text-[#9CA3AF]">Loading...</p>
            </div>
          }>
            <VerifyEmailClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
