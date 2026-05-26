import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!session.user.emailVerified) {
    redirect("/auth/verify-email");
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="border-b border-default">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-heading">SecureGate</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-card rounded-xl border border-default p-8">
          <h2 className="text-2xl font-bold text-heading mb-2">Dashboard</h2>
          <p className="text-muted">
            You are authenticated and verified. Welcome to SecureGate.
          </p>
        </div>
      </main>
    </div>
  );
}
