"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/lib/types";

export default function SettingsClient({ vendor }: { vendor: Vendor }) {
  const [shopName, setShopName] = useState(vendor.shop_name);
  const [whatsapp, setWhatsapp] = useState(vendor.whatsapp_number);
  const [bio, setBio] = useState(vendor.bio ?? "");
  const [deliveryFee, setDeliveryFee] = useState(String(vendor.delivery_fee));
  const [isActive, setIsActive] = useState(vendor.is_active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const storeUrl =
    typeof window !== "undefined" ? `${window.location.origin}/${vendor.slug}` : "";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const supabase = createClient();
    const digits = whatsapp.replace(/[^\d]/g, "").replace(/^0/, "234");
    const { error: dbErr } = await supabase
      .from("vendors")
      .update({
        shop_name: shopName.trim(),
        whatsapp_number: digits,
        bio: bio.trim(),
        delivery_fee: Number(deliveryFee) || 0,
        is_active: isActive,
      })
      .eq("id", vendor.id);

    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setSaved(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your store link:", storeUrl);
    }
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Settings
      </h1>

      {/* Store link */}
      <section className="rounded-3xl border border-ink/10 bg-forest p-6 text-paper">
        <p className="font-display text-sm font-bold tracking-widest uppercase text-leaf">
          Your store link
        </p>
        <p className="mt-2 truncate font-display text-lg font-bold">
          /{vendor.slug}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={copyLink}
            className="rounded-xl bg-leaf px-5 py-2.5 font-display text-sm font-bold text-ink transition hover:opacity-90"
          >
            {copied ? "✓ Copied!" : "Copy full link"}
          </button>
          <a
            href={`/${vendor.slug}`}
            target="_blank"
            className="rounded-xl border border-paper/25 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10"
          >
            Open store ↗
          </a>
        </div>
        <p className="mt-3 text-xs text-paper/60">
          Put this in your Instagram bio and WhatsApp status. When your shop is
          paused below, this link shows customers a friendly notice instead.
        </p>
      </section>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-sm font-semibold">Shop name</label>
          <input
            required
            maxLength={60}
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">WhatsApp number</label>
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Short description</label>
          <input
            maxLength={120}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Delivery fee (₦)</label>
          <input
            type="number"
            min="0"
            step="50"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-leaf-deep"
          />
          <span>
            <span className="block text-sm font-bold">Shop is open</span>
            <span className="block text-xs text-ink/50">
              Uncheck to pause ordering without deleting anything.
            </span>
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl bg-leaf/15 px-4 py-3 text-sm text-leaf-deep">
            ✓ Saved. Your storefront is updated.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-ink px-6 py-3 font-display font-bold text-paper transition hover:bg-ink-2 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
