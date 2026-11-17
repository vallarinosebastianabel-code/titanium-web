-- Titanium Motors — schema para panel admin (Supabase)
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------------
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  stock_number text not null unique,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'sold')),
  featured boolean not null default false,

  make text not null,
  model text not null,
  trim text,
  year int not null check (year between 1980 and 2100),
  body_type text not null
    check (body_type in ('sedan', 'suv', 'pickup', 'hatchback', 'coupe', 'van')),

  price numeric(12, 2) not null check (price > 0),
  mileage int not null default 0 check (mileage >= 0),
  transmission text not null default 'automatic'
    check (transmission in ('automatic', 'manual')),
  fuel_type text not null default 'gasoline'
    check (fuel_type in ('gasoline', 'diesel', 'hybrid', 'electric')),
  drivetrain text
    check (drivetrain is null or drivetrain in ('fwd', 'rwd', 'awd', '4x4')),
  engine text,
  exterior_color text,
  interior_color text,
  vin text check (vin is null or char_length(vin) = 17),

  badges text[] not null default '{}',
  features text[] not null default '{}',
  description text not null default '',

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists vehicles_status_idx on public.vehicles (status);
create index if not exists vehicles_featured_idx on public.vehicles (featured);
create index if not exists vehicle_images_vehicle_id_idx on public.vehicle_images (vehicle_id, sort_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
before update on public.vehicles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Helper: ¿el usuario autenticado es admin?
-- Marca el usuario en Authentication → Users → User → App Metadata:
--   { "role": "admin" }
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
alter table public.vehicles enable row level security;
alter table public.vehicle_images enable row level security;

drop policy if exists "Public read available vehicles" on public.vehicles;
create policy "Public read available vehicles"
  on public.vehicles for select
  using (status in ('available', 'reserved') or public.is_admin());

drop policy if exists "Admin insert vehicles" on public.vehicles;
create policy "Admin insert vehicles"
  on public.vehicles for insert
  with check (public.is_admin());

drop policy if exists "Admin update vehicles" on public.vehicles;
create policy "Admin update vehicles"
  on public.vehicles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete vehicles" on public.vehicles;
create policy "Admin delete vehicles"
  on public.vehicles for delete
  using (public.is_admin());

drop policy if exists "Public read vehicle images" on public.vehicle_images;
create policy "Public read vehicle images"
  on public.vehicle_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.status in ('available', 'reserved')
    )
  );

drop policy if exists "Admin insert vehicle images" on public.vehicle_images;
create policy "Admin insert vehicle images"
  on public.vehicle_images for insert
  with check (public.is_admin());

drop policy if exists "Admin update vehicle images" on public.vehicle_images;
create policy "Admin update vehicle images"
  on public.vehicle_images for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete vehicle images" on public.vehicle_images;
create policy "Admin delete vehicle images"
  on public.vehicle_images for delete
  using (public.is_admin());

-- ------------------------------------------------------------------
-- Storage bucket (fotos)
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read vehicle photos" on storage.objects;
create policy "Public read vehicle photos"
  on storage.objects for select
  using (bucket_id = 'vehicles');

drop policy if exists "Admin upload vehicle photos" on storage.objects;
create policy "Admin upload vehicle photos"
  on storage.objects for insert
  with check (bucket_id = 'vehicles' and public.is_admin());

drop policy if exists "Admin update vehicle photos" on storage.objects;
create policy "Admin update vehicle photos"
  on storage.objects for update
  using (bucket_id = 'vehicles' and public.is_admin())
  with check (bucket_id = 'vehicles' and public.is_admin());

drop policy if exists "Admin delete vehicle photos" on storage.objects;
create policy "Admin delete vehicle photos"
  on storage.objects for delete
  using (bucket_id = 'vehicles' and public.is_admin());
