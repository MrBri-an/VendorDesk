"use client";

import { useState } from "react";

export default function PayButton({
  orderId,
  amountLabel,
}: {
  orderId: string;
  amountLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error ?? "Could not start payment");
      }
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed to start");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={pay}
        disabled={loading}
        className="w-full rounded-2xl border-2 border-ink bg-white py-4 font-display text-lg font-bold text-ink transition hover:bg-paper-2 disabled:opacity-50"
      >
        {loading ? "Opening payment…" : `Pay now · ${amountLabel}`}
      </button>
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
