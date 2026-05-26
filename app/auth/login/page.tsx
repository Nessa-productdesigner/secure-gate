import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-default p-8">
          <h1 className="text-2xl font-bold text-heading mb-1">Welcome back</h1>
          <p className="text-muted mb-6">Sign in to your account</p>
          <LoginForm />
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link href="/auth/forgot-password" className="text-link hover:underline">
              Forgot your password?
            </Link>
            <p className="text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-link hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
