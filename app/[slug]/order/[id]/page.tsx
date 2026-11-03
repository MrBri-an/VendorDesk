import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { formatNaira, whatsappLink } from "@/lib/utils";
import type { Order, Vendor } from "@/lib/types";
import { notFound } from "next/navigation";
import PayButton from "../pay-button";

export const dynamic = "force-dynamic";

export default async function OrderConfirmation({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();
  const o = order as Order;

  const supabase = await createClient();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!vendor || vendor.id !== o.vendor_id) notFound();
  const v = vendor as Vendor;

  const paystackEnabled = Boolean(process.env.PAYSTACK_SECRET_KEY);

  const summary = [
    `*New order — ${v.shop_name}*`,
    "",
    ...o.items.map(
      (i) => `• ${i.qty}× ${i.name} — ${formatNaira(Number(i.price) * i.qty)}`
    ),
    "",
    `Subtotal: ${formatNaira(Number(o.subtotal))}`,
    `Delivery: ${formatNaira(Number(o.delivery_fee))}`,
    `*Total: ${formatNaira(Number(o.total))}*`,
    "",
    `Name: ${o.customer_name}`,
    `Phone: ${o.customer_phone}`,
    o.customer_address ? `Address: ${o.customer_address}` : "",
    o.note ? `Note: ${o.note}` : "",
    "",
    `Order ref: ${o.id.slice(0, 8).toUpperCase()}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <main className="mx-auto max-w-md px-5 py-12">
      {/* Success card */}
      <div className="stagger rounded-[2rem] border border-ink/10 bg-white p-7 text-center shadow-lift">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf/20 text-3xl">
          🎉
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight">
          Order placed<span className="text-papaya">!</span>
        </h1>
        <p className="mt-2 text-ink/60">
          One last tap — send it to {v.shop_name} on WhatsApp so they see it
          right away.
        </p>

        <a
          href={whatsappLink(v.whatsapp_number, summary)}
          target="_blank"
          className="mt-6 block rounded-2xl bg-leaf py-4 font-display text-lg font-bold text-ink transition hover:opacity-90"
        >
          Send on WhatsApp →
        </a>

        {o.payment_status === "unpaid" ? (
          paystackEnabled ? (
            <div className="mt-3">
              <PayButton
                orderId={o.id}
                amountLabel={formatNaira(Number(o.total))}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-paper-2 px-4 py-3 text-sm text-ink/60">
              💵 Pay {formatNaira(Number(o.total))} on delivery / transfer —{" "}
              {v.shop_name} will confirm your payment on WhatsApp.
            </p>
          )
        ) : (
          <p className="mt-4 rounded-xl bg-leaf/15 px-4 py-3 text-sm font-bold text-leaf-deep">
            ✓ Payment received — thank you!
          </p>
        )}
      </div>

      {/* Receipt */}
      <div className="mt-6 rounded-[2rem] border border-ink/10 bg-white p-6">
        <p className="font-display text-sm font-bold tracking-widest text-ink/40 uppercase">
          Receipt · {o.id.slice(0, 8).toUpperCase()}
        </p>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {o.items.map((i) => (
              <tr key={i.id} className="border-b border-ink/5">
                <td className="py-2">
                  {i.qty}× {i.name}
                </td>
                <td className="py-2 text-right">
                  {formatNaira(Number(i.price) * i.qty)}
                </td>
              </tr>
            ))}
            <tr className="border-b border-ink/5">
              <td className="py-2 text-ink/60">Delivery</td>
              <td className="py-2 text-right">
                {formatNaira(Number(o.delivery_fee))}
              </td>
            </tr>
            <tr>
              <td className="pt-2 font-display font-extrabold">Total</td>
              <td className="pt-2 text-right font-display font-extrabold">
                {formatNaira(Number(o.total))}
              </td>
            </tr>
          </tbody>
        </table>

        {o.customer_address && (
          <p className="mt-4 text-sm text-ink/60">
            <span className="font-semibold text-ink">Deliver to:</span>{" "}
            {o.customer_address}
          </p>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-ink/40">
        Powered by VendorDesk
      </p>
    </main>
  );
}
