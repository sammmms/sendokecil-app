-- ==========================================================
-- SENDOKECIL EST 2026 - SUPABASE DATABASE MIGRATION SCRIPT
-- Paste this script into your Supabase SQL Editor and click "RUN"
-- ==========================================================

-- 1. Create Orders Table
create table if not exists public.orders (
  id text primary key,
  order_number text not null,
  order_date text not null,
  customer_name text not null,
  customer_phone text,
  order_type text not null default 'antar',
  delivery_address text,
  delivery_time_note text,
  priority text not null default 'normal',
  items jsonb not null default '[]'::jsonb,
  total_pcs integer not null default 0,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  total_amount numeric not null default 0,
  total_hpp numeric not null default 0,
  net_profit numeric not null default 0,
  payment_method text not null default 'TF',
  payment_status text not null default 'menunggu_konfirmasi',
  fulfillment_status text not null default 'menunggu',
  payment_proof_url text,
  payment_proof_uploaded_at text,
  payment_approved_at text,
  payment_approved_by text,
  customer_notes text,
  admin_notes text,
  greeting_card jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  tagline text,
  description text,
  price numeric not null default 15000,
  category text not null default 'Gabin',
  image text,
  badge text,
  is_available boolean not null default true,
  recipe jsonb not null default '[]'::jsonb,
  custom_hpp numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create HPP Components Table
create table if not exists public.hpp_components (
  id text primary key,
  name text not null,
  category text not null default 'bahan_baku',
  cost numeric not null default 0,
  unit text not null default 'porsi',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.hpp_components enable row level security;

-- 5. Policies allowing access for anon key
drop policy if exists "Enable all for orders" on public.orders;
create policy "Enable all for orders" on public.orders for all using (true) with check (true);

drop policy if exists "Enable all for products" on public.products;
create policy "Enable all for products" on public.products for all using (true) with check (true);

drop policy if exists "Enable all for hpp_components" on public.hpp_components;
create policy "Enable all for hpp_components" on public.hpp_components for all using (true) with check (true);

-- 6. Enable Realtime cross-device updates
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.hpp_components;

-- 7. Seed Initial Gabin Variants
insert into public.products (id, name, tagline, description, price, category, image, badge, is_available) values
(
  'choco-oreo',
  'Gabin Choco Oreo',
  'Fla Cokelat Pekat & Topping Biskuit Oreo Renyah',
  'Kue gabin renyah dengan isian fla cokelat lumer manis pas, dipadu taburan remahan Oreo yang melimpah.',
  15000,
  'Gabin',
  '/images/products/choco-oreo.jpg',
  'Best Seller 🍫',
  true
),
(
  'strawberry',
  'Gabin Strawberry',
  'Fla Strawberry Segar Manis Gurih',
  'Kue gabin gurih isi fla strawberry asli dengan aroma buah segar dan rasa manis asam yang pas di lidah.',
  15000,
  'Gabin',
  '/images/products/strawberry.jpg',
  'Fresh & Fruity 🍓',
  true
),
(
  'matcha',
  'Gabin Matcha',
  'Fla Uji Matcha Jepang Beraroma Wangi',
  'Perpaduan istimewa kue gabin krispi dengan fla teh hijau khas Jepang yang harum dan tidak kemanisan.',
  15000,
  'Gabin',
  '/images/products/matcha.jpg',
  'Zen Aroma 🍵',
  true
),
(
  'cookies-cream',
  'Gabin Cookies & Cream',
  'Fla Vanilla Cream Lembut dengan Remukan Biskuit',
  'Kue gabin klasik dengan isian fla krim susu vanila sutra bertabur biskuit cokelat gurih nikmat.',
  15000,
  'Gabin',
  '/images/products/cookies-cream.jpg',
  'Classic Favorite 🍪',
  true
)
on conflict (id) do nothing;
