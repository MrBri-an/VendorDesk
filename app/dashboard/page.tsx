import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/utils";
import type { Order, Vendor } from "@/lib/types";
import OrdersClient from "./orders-client";

export const dynamic = "force-dynamic";

export default async function DashboardOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const v = vendor as Vendor;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("vendor_id", v.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const { count: viewCount } = await supabase
    .from("store_views")
    .select("*", { count: "exact", head: true })
    .eq("vendor_id", v.id);

  const list = (orders ?? []) as Order[];

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaySales = list
    .filter(
      (o) =>
        o.status !== "cancelled" &&
        new Date(o.created_at) >= startOfToday
    )
    .reduce((sum, o) => sum + Number(o.total), 0);

  const newCount = list.filter((o) => o.status === "new").length;

  const stats = [
    { label: "Sales today", value: formatNaira(todaySales) },
    { label: "Total orders", value: String(list.length) },
    { label: "Needs action", value: String(newCount), accent: newCount > 0 },
    { label: "Store visits", value: String(viewCount ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Orders
        </h1>
        <Link
          href={`/${v.slug}`}
          target="_blank"
          className="rounded-xl bg-leaf px-4 py-2.5 text-sm font-bold text-ink transition hover:opacity-90 sm:hidden"
        >
          View store ↗
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border p-4 ${
              s.accent
                ? "border-papaya/40 bg-papaya/10"
                : "border-ink/10 bg-white"
            }`}
          >
            <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">
              {s.label}
            </p>
            <p className="mt-1.5 font-display text-2xl font-extrabold">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
          <p className="font-display text-xl font-bold">No orders yet</p>
          <p className="mx-auto mt-2 max-w-sm text-ink/60">
            Share your store link everywhere your customers are — WhatsApp
            status, Instagram bio, broadcast lists.
          </p>
          <Link
            href="/dashboard/products"
            className="mt-5 inline-block rounded-xl bg-ink px-5 py-3 font-display font-bold text-paper"
          >
            Add your first product →
          </Link>
        </div>
      ) : (
        <OrdersClient orders={list} />
      )}
    </div>
  );
}
