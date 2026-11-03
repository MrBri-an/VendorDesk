import { createClient } from "@/lib/supabase/server";
import type { Product, Vendor } from "@/lib/types";
import ProductsClient from "./products-client";

export const dynamic = "force-dynamic";

export default async function DashboardProducts() {
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

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", v.id)
    .order("sort_order");

  return (
    <ProductsClient
      vendor={v}
      initialProducts={(products ?? []) as Product[]}
    />
  );
}
