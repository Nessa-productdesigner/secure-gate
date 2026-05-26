import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-default p-8">
          <h1 className="text-2xl font-bold text-heading mb-1">Forgot password?</h1>
          <p className="text-muted mb-6">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <ForgotPasswordForm />
          <p className="mt-4 text-center text-sm text-muted">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-link hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
