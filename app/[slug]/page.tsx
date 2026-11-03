import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product, Vendor } from "@/lib/types";
import StorefrontClient from "./storefront-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("shop_name, bio")
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor) return { title: "Shop not found" };
  return {
    title: vendor.shop_name,
    description: vendor.bio || `Order from ${vendor.shop_name} on WhatsApp.`,
  };
}

export default async function Storefront({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor) notFound();
  const v = vendor as Vendor;

  if (!v.is_active) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="font-display text-5xl">🛑</span>
        <h1 className="mt-5 font-display text-3xl font-extrabold">
          {v.shop_name} is paused
        </h1>
        <p className="mt-3 max-w-sm text-ink/60">
          This shop isn&apos;t taking orders right now. Please check back
          soon!
        </p>
      </main>
    );
  }

  // Count the visit (anon insert is allowed by RLS)
  void supabase.from("store_views").insert({ vendor_id: v.id });

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", v.id)
    .order("sort_order");

  const list = (products ?? []) as Product[];
  const paystackEnabled = Boolean(process.env.PAYSTACK_SECRET_KEY);

  return (
    <StorefrontClient
      vendor={v}
      products={list}
      paystackEnabled={paystackEnabled}
    />
  );
}
