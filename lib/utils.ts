export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/** Normalize any local WhatsApp input to international digits, e.g. 2348012345678 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return digits;
}

export function isInternationalPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return /^234\d{10}$/.test(digits);
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "shop"
  );
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export function buildOrderSummary(opts: {
  shopName: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note: string;
  baseUrl: string;
  vendorSlug: string;
}): string {
  const lines = [
    `*New order — ${opts.shopName}*`,
    "",
    ...opts.items.map(
      (i) => `• ${i.qty}× ${i.name} — ${formatNaira(i.price * i.qty)}`
    ),
    "",
    `Subtotal: ${formatNaira(opts.subtotal)}`,
    `Delivery: ${formatNaira(opts.deliveryFee)}`,
    `*Total: ${formatNaira(opts.total)}*`,
    "",
    `Name: ${opts.customerName}`,
    `Phone: ${opts.customerPhone}`,
    `Address: ${opts.customerAddress}`,
    opts.note ? `Note: ${opts.note}` : "",
    "",
    `Order ref: ${opts.orderId.slice(0, 8).toUpperCase()}`,
  ];
  return lines.filter(Boolean).join("\n");
}

export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}
