-- =============================================================
-- VendorDesk — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → paste → Run
-- =============================================================

-- ---------- Tables ----------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  slug text not null unique,
  shop_name text not null,
  whatsapp_number text not null,          -- international digits, e.g. 2348012345678
  bio text default '',
  logo_url text,
  delivery_fee numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors on delete cascade,
  name text not null,
  description text default '',
  price numeric not null,
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_address text default '',
  note text default '',
  items jsonb not null,                   -- [{ id, name, price, qty }]
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  status text not null default 'new'
    check (status in ('new','confirmed','delivered','cancelled')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid')),
  payment_reference text,
  created_at timestamptz not null default now()
);

create table public.store_views (
  id bigint generated always as identity primary key,
  vendor_id uuid not null references public.vendors on delete cascade,
  viewed_at timestamptz not null default now()
);

-- ---------- Indexes ----------

create index products_vendor_idx on public.products (vendor_id, sort_order);
create index orders_vendor_idx on public.orders (vendor_id, created_at desc);
create index orders_payref_idx on public.orders (payment_reference);

-- ---------- Row Level Security ----------

alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.store_views enable row level security;

-- vendors: owner full control; public can read active shops
create policy "vendor_owner_all" on public.vendors
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "public_read_vendors" on public.vendors
  for select using (true);

-- products: public read; owner writes via vendor join
create policy "public_read_products" on public.products
  for select using (true);
create policy "vendor_insert_products" on public.products
  for insert with check (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );
create policy "vendor_update_products" on public.products
  for update using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );
create policy "vendor_delete_products" on public.products
  for delete using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- orders: created via API route (service role bypasses RLS); vendor reads/updates own
create policy "vendor_read_orders" on public.orders
  for select using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );
create policy "vendor_update_orders" on public.orders
  for update using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- store views: anonymous inserts (visit counter); vendor reads own
create policy "anon_insert_views" on public.store_views
  for insert with check (true);
create policy "vendor_read_views" on public.store_views
  for select using (
    exists (select 1 from public.vendors v where v.id = vendor_id and v.user_id = auth.uid())
  );

-- ---------- Storage (product images) ----------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "public_read_product_images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "auth_upload_product_images" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and auth.role() = 'authenticated'
  );

-- ---------- Triggers: auto-create vendor on signup (optional path) ----------
-- We create the vendor row through onboarding UI instead; nothing needed here.
