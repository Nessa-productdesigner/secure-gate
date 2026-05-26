import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ResetPasswordWithTokenPage({
  params,
}: {
  params: { token: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-default p-8">
          <h1 className="text-2xl font-bold text-heading mb-1">Reset your password</h1>
          <p className="text-muted mb-6">Enter your new password below.</p>
          <ResetPasswordForm token={params.token} />
          <p className="mt-4 text-center text-sm text-muted">
            <Link href="/auth/forgot-password" className="text-link hover:underline">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
