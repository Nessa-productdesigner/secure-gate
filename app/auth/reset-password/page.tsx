import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB] mb-1">Reset your password</h1>
          <p className="text-[#9CA3AF] mb-6">Enter your new password below.</p>
          <Suspense fallback={
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-[#2563EB] border-t-transparent rounded-full" />
              <p className="text-[#9CA3AF]">Loading...</p>
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
