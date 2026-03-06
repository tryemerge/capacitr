"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@capacitr/auth";

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (authenticated) {
      router.replace("/");
    } else {
      login();
    }
  }, [ready, authenticated, login, router]);

  return null;
}
