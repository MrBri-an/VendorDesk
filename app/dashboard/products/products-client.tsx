"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira } from "@/lib/utils";
import type { Product, Vendor } from "@/lib/types";

interface Draft {
  id?: string;
  name: string;
  price: string;
  description: string;
  image_url: string | null;
  is_available: boolean;
}

const EMPTY: Draft = {
  name: "",
  price: "",
  description: "",
  image_url: null,
  is_available: true,
};

export default function ProductsClient({
  vendor,
  initialProducts,
}: {
  vendor: Vendor;
  initialProducts: Product[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) {
      setError(`Image upload failed: ${upErr.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setDraft((d) => (d ? { ...d, image_url: data.publicUrl } : d));
    setUploading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      name: draft.name.trim(),
      price: Number(draft.price),
      description: draft.description.trim(),
      image_url: draft.image_url,
      is_available: draft.is_available,
    };

    if (!payload.name || Number.isNaN(payload.price)) {
      setError("Product name and a valid price are required.");
      setSaving(false);
      return;
    }

    const { data, error: dbErr } = draft.id
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", draft.id)
          .select()
          .single()
      : await supabase
          .from("products")
          .insert({ ...payload, vendor_id: vendor.id })
          .select()
          .single();

    if (dbErr || !data) {
      setError(dbErr?.message ?? "Could not save product.");
      setSaving(false);
      return;
    }

    setProducts((prev) =>
      draft.id
        ? prev.map((p) => (p.id === data.id ? (data as Product) : p))
        : [...prev, data as Product]
    );
    setDraft(null);
    setSaving(false);
  }

  async function toggleAvailable(p: Product) {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .update({ is_available: !p.is_available })
      .eq("id", p.id)
      .select()
      .single();
    if (data) setProducts((prev) => prev.map((x) => (x.id === p.id ? (data as Product) : x)));
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Products
        </h1>
        <button
          onClick={() => setDraft(EMPTY)}
          className="rounded-xl bg-papaya px-4 py-2.5 font-display text-sm font-bold text-ink transition hover:bg-papaya-deep"
        >
          + Add product
        </button>
      </div>

      {draft && (
        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-3xl border border-ink/15 bg-white p-5 sm:p-6"
        >
          <p className="font-display text-lg font-bold">
            {draft.id ? "Edit product" : "New product"}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Name</label>
              <input
                required
                maxLength={80}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Party Jollof + Chicken"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Price (₦)</label>
              <input
                required
                type="number"
                min="0"
                step="50"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                placeholder="3500"
                className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold">
              Description{" "}
              <span className="font-normal text-ink/40">(optional)</span>
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder="What makes it special?"
              className="mt-1.5 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-semibold">Photo</label>
              <div className="mt-1.5 flex items-center gap-3">
                {draft.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.image_url}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-ink/25 text-ink/30">
                    ?
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-ink/15 px-4 py-2.5 text-sm font-semibold transition hover:border-leaf disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Choose image"}
                </button>
              </div>
            </div>

            <label className="mt-6 flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.is_available}
                onChange={(e) =>
                  setDraft({ ...draft, is_available: e.target.checked })
                }
                className="h-4 w-4 accent-leaf-deep"
              />
              Available for ordering
            </label>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-ink px-6 py-3 font-display font-bold text-paper transition hover:bg-ink-2 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save product"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-xl px-5 py-3 font-semibold text-ink/60 transition hover:bg-ink/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {products.length === 0 && !draft ? (
        <div className="rounded-3xl border border-dashed border-ink/20 p-12 text-center">
          <p className="font-display text-xl font-bold">Empty shelf</p>
          <p className="mt-2 text-ink/60">
            Add your first product — it takes under a minute.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-white p-4"
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-2xl">
                  🛍️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display font-bold leading-tight">
                    {p.name}
                  </p>
                  <button
                    onClick={() => toggleAvailable(p)}
                    title="Toggle availability"
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition ${
                      p.is_available
                        ? "bg-leaf/20 text-leaf-deep"
                        : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {p.is_available ? "Available" : "Sold out"}
                  </button>
                </div>
                {p.description && (
                  <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">
                    {p.description}
                  </p>
                )}
                <p className="mt-1 font-bold">{formatNaira(Number(p.price))}</p>
                <div className="mt-2 flex gap-3 text-sm font-semibold">
                  <button
                    onClick={() =>
                      setDraft({
                        id: p.id,
                        name: p.name,
                        price: String(p.price),
                        description: p.description ?? "",
                        image_url: p.image_url,
                        is_available: p.is_available,
                      })
                    }
                    className="text-forest underline-offset-2 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p)}
                    className="text-ink/40 underline-offset-2 hover:text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
