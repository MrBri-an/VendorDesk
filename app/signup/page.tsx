"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Email confirmation may be required — handle both paths.
    if (data.session) {
      router.push("/onboarding");
    } else {
      router.push("/login?check=1");
    }
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight"
        >
          Vendor<span className="text-leaf-deep">Desk</span>
        </Link>
        <h1 className="mt-10 font-display text-4xl font-extrabold tracking-tight">
          Open your shop<span className="text-papaya">.</span>
        </h1>
        <p className="mt-3 text-ink/60">
          Free to start. Ten minutes to your first link.
        </p>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
            {loading ? "Creating account…" : "Create my shop →"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
