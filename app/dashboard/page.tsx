import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="border-b border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#F9FAFB]">SecureGate</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9CA3AF]">{session.user.email}</span>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-8">
          <h2 className="text-2xl font-bold text-[#F9FAFB] mb-2">Dashboard</h2>
          <p className="text-[#9CA3AF]">
            You are authenticated and verified. Welcome to SecureGate.
          </p>
        </div>
      </main>
    </div>
  );
}
