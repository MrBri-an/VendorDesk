"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkEmail = params.get("check") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(params.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">
        Vendor<span className="text-leaf-deep">Desk</span>
      </Link>
      <h1 className="mt-10 font-display text-4xl font-extrabold tracking-tight">
        Welcome back<span className="text-papaya">.</span>
      </h1>

      {checkEmail && (
        <p className="mt-6 rounded-xl bg-leaf/15 px-4 py-3 text-sm text-forest">
          ✓ Check your email to confirm your account, then log in.
        </p>
      )}
      {params.get("error") === "auth" && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          That confirmation link expired or was already used. Log in below.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-ink py-3.5 font-display font-bold text-paper transition hover:bg-ink-2 disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in →"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-ink underline">
          Open your shop free
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-14">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
