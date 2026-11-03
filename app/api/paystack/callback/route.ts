import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference =
    searchParams.get("reference") ?? searchParams.get("trxref");

  if (!reference || !process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.redirect(`${origin}/?payment=invalid`);
  }

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    }
  );
  const verifyData = await verifyRes.json();

  if (verifyRes.ok && verifyData?.data?.status === "success") {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (order) {
      const o = order as Order;
      await admin
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", o.id);

      // Fetch the vendor slug so we land on the correct order page
      const { data: vendor } = await admin
        .from("vendors")
        .select("slug")
        .eq("id", o.vendor_id)
        .maybeSingle();

      return NextResponse.redirect(
        `${origin}/${vendor?.slug ?? ""}/order/${o.id}?paid=1`
      );
    }
  }

  return NextResponse.redirect(`${origin}/?payment=failed`);
}
