# VendorDesk 🛍️

**Your shop, on WhatsApp.** A storefront + order-automation SaaS for Nigerian
online vendors. Vendors build a catalog, get one link, and customers order
24/7 — every order lands as a clean WhatsApp message, with optional Paystack
card/transfer checkout.

Stack: **Next.js 16 · Supabase · Tailwind 4 · Paystack**. Zero-cost hosting on
free tiers.

---

## 1. One-time setup (≈15 minutes)

### A. Create the Supabase project
1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is
   enough). Pick a name like `vendordesk` and a nearby region.
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This
   creates the tables, security rules, and the product-image storage bucket.
3. Go to **Project Settings → API** and copy three values:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret)

### B. Configure the app
```bash
cp .env.local.example .env.local
# then edit .env.local with the three Supabase values above
```

Optional — card payments: create a [Paystack](https://paystack.com) account,
verify your business, and put your `sk_test_...` secret key in `.env.local`
under `PAYSTACK_SECRET_KEY`. **Without this the app still works** — orders
flow through WhatsApp and vendors collect payment themselves.

> While testing, also set Supabase → Auth → URL Configuration → Site URL to
> `http://localhost:3000` so confirmation links work. For faster pilot
> signups you can temporarily disable "Confirm email" under Auth → Providers.

### C. Run it
```bash
npm install
npm run dev
```
Open http://localhost:3000 → **Sign up → create your shop → add products →
open `/your-shop-name`** and place a test order end-to-end.

## 2. Deploy (free)

1. Push this folder to a GitHub repo.
2. [vercel.com](https://vercel.com) → **Import** the repo.
3. Add the same environment variables in Vercel → Settings → Environment
   Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, and optionally `PAYSTACK_SECRET_KEY` with
   **live** keys when going live).
4. Deploy. Buy a domain (~₦12k/yr, e.g. `vendordesk.ng`) in Vercel or
   Namecheap and attach it.

## 3. Verify before selling (5-minute checklist)

- [ ] Sign up with your own email → shop created → dashboard loads
- [ ] Add 3 products with photos → open the store link on your **phone**
- [ ] Order an item → WhatsApp opens with the full order summary
- [ ] Vendor dashboard shows the order; confirm → delivered status works
- [ ] (If Paystack test key) Pay button opens Paystack → use test card
      `4084 0840 8408 4081`, any future date, CVV `408` → order shows *paid*

## 4. Where the money comes from

| Lane | What | Price | Target (30 days) |
|---|---|---|---|
| Cash-fast | Done-For-You setup (catalog + branding + training) | ₦40k–₦80k one-time | 4–6 sales |
| Recurring | Self-serve subscription | ₦3,500/mo or ₦35k/yr | 10–15 vendors |

**Read [`GTM-PLAYBOOK.md`](GTM-PLAYBOOK.md) — it has your exact daily
outreach scripts and the 30-day plan. Distribution is the real product here.**

## 5. Known v1 limits (fix after first revenue)

- Subscriptions are manual — collect via your own Paystack payment page and
  deactivate non-payers from Settings (open shop toggle).
- No AI auto-replies yet (week-4 feature via Meta WhatsApp Cloud API).
- `store_views` counts every visit, no dedupe — fine for a vendor-facing number.

## Project structure

```
app/
  page.tsx                  # marketing landing
  login/ signup/ onboarding # vendor auth + shop creation
  auth/callback/            # Supabase email-confirmation handler
  dashboard/                # orders, products, settings (vendor side)
  [slug]/                   # PUBLIC storefront + order confirmation
  api/orders/               # order creation (prices recomputed server-side)
  api/paystack/             # payment initialize + verify callback
  proxy.ts                  # auth-gated routes
lib/                        # supabase clients, money/phone/WhatsApp helpers
supabase/schema.sql         # paste into Supabase SQL editor
```
