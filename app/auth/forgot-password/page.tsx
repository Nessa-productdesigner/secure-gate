import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB] mb-1">Forgot password?</h1>
          <p className="text-[#9CA3AF] mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <ForgotPasswordForm />
          <p className="mt-4 text-center text-sm text-[#9CA3AF]">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
