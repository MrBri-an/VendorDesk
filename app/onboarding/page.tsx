"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isInternationalPhone, normalizePhone, slugify } from "@/lib/utils";

export default function Onboarding() {
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const slugPreview = shopName ? slugify(shopName) : "your-shop";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isInternationalPhone(whatsapp)) {
      setError(
        "Enter a valid Nigerian WhatsApp number, e.g. 08012345678 or 2348012345678"
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Ensure a unique slug
    let slug = slugify(shopName);
    const { data: existing } = await supabase
      .from("vendors")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const { error: insertError } = await supabase.from("vendors").insert({
      user_id: user.id,
      slug,
      shop_name: shopName.trim(),
      whatsapp_number: normalizePhone(whatsapp),
      bio: bio.trim(),
      delivery_fee: Number(deliveryFee) || 0,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/products?welcome=1");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-14">
      <div className="w-full max-w-md">
        <p className="font-display text-sm font-bold tracking-widest text-papaya uppercase">
          Step 1 of 1 · Shop details
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
          Name your shop<span className="text-papaya">.</span>
        </h1>
        <p className="mt-3 text-ink/60">
          You can change all of this later in settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="shop" className="text-sm font-semibold">
              Shop name
            </label>
            <input
              id="shop"
              required
              maxLength={60}
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="e.g. Mama Chidinma Kitchen"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />
            <p className="mt-1.5 text-xs text-ink/50">
              Your link: vendordesk.ng/
              <span className="font-semibold text-forest">{slugPreview}</span>
            </p>
          </div>

          <div>
            <label htmlFor="wa" className="text-sm font-semibold">
              WhatsApp number (orders land here)
            </label>
            <input
              id="wa"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="08012345678"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="bio" className="text-sm font-semibold">
              Short description{" "}
              <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <input
              id="bio"
              maxLength={120}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Jollof · Suya · Cold drinks"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />
          </div>

          <div>
            <label htmlFor="fee" className="text-sm font-semibold">
              Delivery fee (₦){" "}
              <span className="font-normal text-ink/40">(0 = pickup only)</span>
            </label>
            <input
              id="fee"
              type="number"
              min="0"
              step="50"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-papaya py-3.5 font-display font-bold text-ink transition hover:bg-papaya-deep disabled:opacity-50"
          >
            {loading ? "Creating your shop…" : "Create my shop →"}
          </button>
        </form>
      </div>
    </main>
  );
}
