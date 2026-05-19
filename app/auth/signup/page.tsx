import { SignupForm } from "@/components/forms/signup-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8">
          <h1 className="text-2xl font-bold text-[#F9FAFB] mb-1">Create an account</h1>
          <p className="text-[#9CA3AF] mb-6">Get started with SecureGate</p>
          <SignupForm />
          <p className="mt-4 text-center text-sm text-[#9CA3AF]">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#2563EB] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
