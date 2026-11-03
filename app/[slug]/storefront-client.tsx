"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/utils";
import type { Product, Vendor } from "@/lib/types";

interface CartEntry {
  product: Product;
  qty: number;
}

export default function StorefrontClient({
  vendor,
  products,
  paystackEnabled,
}: {
  vendor: Vendor;
  products: Product[];
  paystackEnabled: boolean;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = products.filter((p) => p.is_available);
  const soldOut = products.filter((p) => !p.is_available);

  const entries: CartEntry[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = products.find((p) => p.id === id);
          return product ? { product, qty } : null;
        })
        .filter(Boolean) as CartEntry[],
    [cart, products]
  );

  const subtotal = entries.reduce(
    (s, e) => s + Number(e.product.price) * e.qty,
    0
  );
  const deliveryFee = Number(vendor.delivery_fee) || 0;
  const total = subtotal + (entries.length > 0 ? deliveryFee : 0);
  const itemCount = entries.reduce((s, e) => s + e.qty, 0);

  function addToCart(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  function changeQty(id: string, delta: number) {
    setCart((c) => {
      const next = (c[id] ?? 0) + delta;
      const copy = { ...c };
      if (next <= 0) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (entries.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendor.id,
          items: entries.map((e) => ({ id: e.product.id, qty: e.qty })),
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          note: form.note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");

      router.push(`/${vendor.slug}/order/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen pb-32">
      {/* Vendor header */}
      <header className="grain relative overflow-hidden bg-forest px-5 pt-10 pb-8 text-paper sm:px-8">
        <div className="dotgrid absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex max-w-3xl items-center gap-4">
          {vendor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.logo_url}
              alt={vendor.shop_name}
              className="h-16 w-16 rounded-2xl border-2 border-paper/30 object-cover sm:h-20 sm:w-20"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold font-display text-3xl font-extrabold text-ink sm:h-20 sm:w-20">
              {vendor.shop_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
              {vendor.shop_name}
            </h1>
            {vendor.bio && (
              <p className="mt-1 text-sm text-paper/70 sm:text-base">
                {vendor.bio}
              </p>
            )}
            <p className="mt-1.5 text-xs text-paper/50">
              {deliveryFee > 0
                ? `Delivery ${formatNaira(deliveryFee)} · Pickup available`
                : "Pickup available"}
            </p>
          </div>
        </div>
      </header>

      {/* Products */}
      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {available.length === 0 && soldOut.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
            <p className="font-display text-xl font-bold">Menu coming soon</p>
            <p className="mt-2 text-ink/60">
              Check back shortly — items are being added.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {available.map((p) => {
              const qty = cart[p.id] ?? 0;
              return (
                <article
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-lift"
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-paper-2 text-5xl">
                      🍽️
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="font-display text-lg font-bold leading-tight">
                      {p.name}
                    </h2>
                    {p.description && (
                      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink/60">
                        {p.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-display text-xl font-extrabold text-forest">
                        {formatNaira(Number(p.price))}
                      </p>
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(p.id)}
                          className="rounded-xl bg-ink px-4 py-2 font-display text-sm font-bold text-paper transition hover:bg-ink-2"
                        >
                          + Add
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl bg-ink px-2 py-1.5 text-paper">
                          <button
                            onClick={() => changeQty(p.id, -1)}
                            className="px-2 text-lg font-bold"
                            aria-label="Remove one"
                          >
                            −
                          </button>
                          <span className="min-w-5 text-center font-display font-bold">
                            {qty}
                          </span>
                          <button
                            onClick={() => changeQty(p.id, 1)}
                            className="px-2 text-lg font-bold"
                            aria-label="Add one"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {soldOut.map((p) => (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white opacity-60"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-44 w-full object-cover grayscale"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-paper-2 text-5xl grayscale">
                    🍽️
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-display text-lg font-bold leading-tight">
                    {p.name}
                  </h2>
                  <p className="mt-2 inline-block rounded-full bg-ink/10 px-2.5 py-1 text-xs font-bold text-ink/60">
                    Sold out
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Sticky cart bar */}
      {itemCount > 0 && !sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-[rise_0.3s_ease] p-4">
          <button
            onClick={() => setSheetOpen(true)}
            className="mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-leaf px-5 py-4 font-display font-bold text-ink shadow-lift transition hover:opacity-90"
          >
            <span>
              {itemCount} item{itemCount > 1 ? "s" : ""} ·{" "}
              {formatNaira(total)}
            </span>
            <span>View order →</span>
          </button>
        </div>
      )}

      {/* Checkout sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            aria-label="Close checkout"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
          />
          <form
            onSubmit={submitOrder}
            className="animate-[rise_0.3s_ease] relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-paper p-6 sm:rounded-[2rem]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink/15" />
            <h2 className="font-display text-2xl font-extrabold">
              Your order
              <span className="text-papaya">.</span>
            </h2>

            <div className="mt-4 space-y-2">
              {entries.map((e) => (
                <div
                  key={e.product.id}
                  className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeQty(e.product.id, -1)}
                      className="font-bold text-ink/60"
                    >
                      −
                    </button>
                    <span className="min-w-4 text-center font-bold">
                      {e.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(e.product.id, 1)}
                      className="font-bold text-ink/60"
                    >
                      +
                    </button>
                  </div>
                  <span className="flex-1 truncate font-semibold">
                    {e.product.name}
                  </span>
                  <span className="font-bold">
                    {formatNaira(Number(e.product.price) * e.qty)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink/10 pt-3 text-sm">
                <span className="text-ink/60">
                  Subtotal + delivery ({formatNaira(deliveryFee)})
                </span>
                <span className="font-display text-lg font-extrabold">
                  {formatNaira(total)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
              />
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number (WhatsApp)"
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
              />
              {deliveryFee > 0 && (
                <input
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Delivery address"
                  className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
                />
              )}
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Note for the vendor (optional)"
                className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-2xl bg-leaf py-4 font-display text-lg font-bold text-ink transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? "Placing order…"
                : `Send order · ${formatNaira(total)}`}
            </button>
            {paystackEnabled && (
              <p className="mt-2.5 text-center text-xs text-ink/50">
                You&apos;ll get a secure card/transfer payment option after
                ordering.
              </p>
            )}
          </form>
        </div>
      )}
    </main>
  );
}
