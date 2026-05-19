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
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
