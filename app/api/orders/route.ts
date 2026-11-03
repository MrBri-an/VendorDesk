import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product, Vendor } from "@/lib/types";

interface Body {
  vendor_id: string;
  items: { id: string; qty: number }[];
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  note?: string;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { vendor_id, items, customer_name, customer_phone } = body;

  if (
    !vendor_id ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !customer_name?.trim() ||
    !customer_phone?.trim()
  ) {
    return NextResponse.json(
      { error: "Missing order details" },
      { status: 400 }
    );
  }

  if (items.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > 99)) {
    return NextResponse.json({ error: "Invalid quantities" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: vendor } = await admin
    .from("vendors")
    .select("*")
    .eq("id", vendor_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!vendor) {
    return NextResponse.json(
      { error: "This shop isn't taking orders right now" },
      { status: 404 }
    );
  }
  const v = vendor as Vendor;

  // Recompute prices server-side — never trust client amounts
  const { data: dbProducts } = await admin
    .from("products")
    .select("*")
    .in(
      "id",
      items.map((i) => i.id)
    )
    .eq("vendor_id", v.id)
    .eq("is_available", true);

  const products = (dbProducts ?? []) as Product[];
  if (products.length === 0) {
    return NextResponse.json(
      { error: "The items you selected are no longer available" },
      { status: 400 }
    );
  }

  const orderItems = items
    .map((i) => {
      const p = products.find((x) => x.id === i.id);
      return p ? { id: p.id, name: p.name, price: Number(p.price), qty: i.qty } : null;
    })
    .filter(Boolean) as { id: string; name: string; price: number; qty: number }[];

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = Number(v.delivery_fee) || 0;
  const total = subtotal + deliveryFee;

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      vendor_id: v.id,
      customer_name: customer_name.trim().slice(0, 120),
      customer_phone: customer_phone.trim().slice(0, 30),
      customer_address: (body.customer_address ?? "").trim().slice(0, 300),
      note: (body.note ?? "").trim().slice(0, 300),
      items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total,
    })
    .select("id")
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: "Could not save your order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: order.id });
}
