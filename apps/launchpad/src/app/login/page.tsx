"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@capacitr/auth";

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = useAuth();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="h-full bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-950 flex items-center justify-center">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-100">Capacitr</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to the Idea Launchpad</p>
        </div>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
