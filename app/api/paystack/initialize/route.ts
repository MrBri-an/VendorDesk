import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export async function POST(request: Request) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet" },
      { status: 501 }
    );
  }

  let body: { order_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.order_id) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", body.order_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const o = order as Order;

  if (o.payment_status === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const reference = `vd_${o.id.replace(/-/g, "").slice(0, 16)}_${Date.now()}`;

  const initRes = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: `customer+${o.id.replace(/-/g, "").slice(0, 10)}@vendordesk.ng`,
        amount: Math.round(Number(o.total) * 100), // kobo
        reference,
        callback_url: `${origin}/api/paystack/callback`,
        metadata: {
          order_id: o.id,
          vendor_id: o.vendor_id,
          custom_fields: [
            {
              display_name: "Order",
              variable_name: "order",
              value: o.id.slice(0, 8).toUpperCase(),
            },
          ],
        },
      }),
    }
  );

  const initData = await initRes.json();

  if (!initRes.ok || !initData?.data?.authorization_url) {
    return NextResponse.json(
      { error: initData?.message ?? "Payment initialization failed" },
      { status: 502 }
    );
  }

  await admin
    .from("orders")
    .update({ payment_reference: reference })
    .eq("id", o.id);

  return NextResponse.json({
    authorization_url: initData.data.authorization_url,
  });
}
