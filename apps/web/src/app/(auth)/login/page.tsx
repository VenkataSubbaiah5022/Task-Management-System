import { AuthForm } from "@/components/auth/auth-form";
import { APP_NAME } from "@tms/config";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Back
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Sign in to {APP_NAME}</h1>
        <p className="mt-1 text-sm text-zinc-400">Access your workspaces and boards.</p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
