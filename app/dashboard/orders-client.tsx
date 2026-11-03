"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira, whatsappLink } from "@/lib/utils";
import type { Order } from "@/lib/types";

const STATUS_STYLE: Record<Order["status"], string> = {
  new: "bg-papaya/15 text-papaya-deep",
  confirmed: "bg-gold/20 text-yellow-700",
  delivered: "bg-leaf/15 text-leaf-deep",
  cancelled: "bg-ink/10 text-ink/50",
};

export default function OrdersClient({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function updateStatus(id: string, status: Order["status"]) {
    setBusy(id);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
    setBusy(null);
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <article
          key={o.id}
          className="overflow-hidden rounded-2xl border border-ink/10 bg-white"
        >
          <button
            onClick={() => setOpen(open === o.id ? null : o.id)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display font-bold">{o.customer_name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[o.status]}`}
                >
                  {o.status}
                </span>
                {o.payment_status === "paid" && (
                  <span className="rounded-full bg-forest px-2 py-0.5 text-xs font-bold text-paper">
                    paid
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-sm text-ink/60">
                {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-extrabold">
                {formatNaira(Number(o.total))}
              </p>
              <p className="text-xs text-ink/50">
                {new Date(o.created_at).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span className="ml-1 text-ink/30">{open === o.id ? "▴" : "▾"}</span>
          </button>

          {open === o.id && (
            <div className="border-t border-ink/10 bg-paper/60 px-4 py-4 sm:px-5">
              <table className="w-full text-sm">
                <tbody>
                  {o.items.map((i) => (
                    <tr key={i.id} className="border-b border-ink/5">
                      <td className="py-1.5">
                        {i.qty}× {i.name}
                      </td>
                      <td className="py-1.5 text-right">
                        {formatNaira(Number(i.price) * i.qty)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-b border-ink/5">
                    <td className="py-1.5 text-ink/60">Delivery</td>
                    <td className="py-1.5 text-right">
                      {formatNaira(Number(o.delivery_fee))}
                    </td>
                  </tr>
                  <tr>
                    <td className="pt-2 font-bold">Total</td>
                    <td className="pt-2 text-right font-bold">
                      {formatNaira(Number(o.total))}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-3 space-y-1 text-sm text-ink/70">
                <p>
                  <span className="font-semibold">Phone:</span>{" "}
                  {o.customer_phone}
                </p>
                {o.customer_address && (
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {o.customer_address}
                  </p>
                )}
                {o.note && (
                  <p>
                    <span className="font-semibold">Note:</span> {o.note}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {o.status === "new" && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => updateStatus(o.id, "confirmed")}
                    className="rounded-xl bg-forest px-4 py-2 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
                  >
                    Confirm order
                  </button>
                )}
                {o.status === "confirmed" && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => updateStatus(o.id, "delivered")}
                    className="rounded-xl bg-leaf-deep px-4 py-2 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
                  >
                    Mark delivered
                  </button>
                )}
                {o.status !== "cancelled" && o.status !== "delivered" && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => updateStatus(o.id, "cancelled")}
                    className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/60 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
                <a
                  href={whatsappLink(
                    o.customer_phone,
                    `Hello ${o.customer_name}! About your order ${o.id
                      .slice(0, 8)
                      .toUpperCase()} —`
                  )}
                  target="_blank"
                  className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm font-bold text-ink/70 transition hover:border-leaf hover:text-leaf-deep"
                >
                  Message customer
                </a>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
