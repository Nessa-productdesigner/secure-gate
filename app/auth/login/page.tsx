import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB] mb-1">Welcome back</h1>
          <p className="text-[#9CA3AF] mb-6">Sign in to your account</p>
          <LoginForm />
          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            <Link href="/auth/forgot-password" className="text-[#2563EB] hover:underline">
              Forgot your password?
            </Link>
            <p className="text-[#9CA3AF]">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-[#2563EB] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
