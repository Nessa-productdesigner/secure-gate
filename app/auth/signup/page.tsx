import { SignupForm } from "@/components/forms/signup-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-default p-8">
          <h1 className="text-2xl font-bold text-heading mb-1">Create an account</h1>
          <p className="text-muted mb-6">Get started with SecureGate</p>
          <SignupForm />
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-link hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
