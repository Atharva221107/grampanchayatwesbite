/*
# Gram Panchayat Portal — Schema Setup

## Overview
Creates all content tables for the Gram Panchayat Information Portal, a
public-facing government village website with an authenticated admin panel.

## Tables Created

1. **village_info** — single-row table holding all textual village data
   (history, geography, economy, etc.) plus a Google Map embed URL.
2. **sarpanch** — current/former sarpanch entries with photo, contact,
   message, and term dates.
3. **panchayat_members** — ward members and committee members, with a
   flag for former members.
4. **schemes** — government scheme catalog with eligibility, documents,
   application process, status (active/closed), and featured flag.
5. **announcements** — time-bound announcements with priority, pinning,
   start/expiry dates.
6. **notices** — downloadable notices with file type and category.
7. **gallery_albums** — album groupings for the photo gallery.
8. **gallery_images** — individual images belonging to an album (FK).
9. **contact_submissions** — citizen inquiry form submissions.
10. **site_settings** — single-row site branding and office info.

## Security (RLS)

- **Public SELECT** (anon + authenticated) on: village_info, sarpanch,
  panchayat_members, schemes, announcements, notices, gallery_albums,
  gallery_images, site_settings.
- **Authenticated-only INSERT / UPDATE / DELETE** on all content tables
  (admin manages content after signing in).
- **Public INSERT only** on contact_submissions (citizens can submit
  inquiries without signing in; no public read/update/delete).

## Notes
- All tables use uuid primary keys with gen_random_uuid() defaults.
- Timestamps default to now().
- village_info and site_settings are seeded with a single default row.
- gallery_images.album_id has ON DELETE SET NULL so deleting an album
  keeps the images (orphan-safe).
- Triggers updated_at columns automatically on row modification.
*/

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Helper: updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1. village_info (single row)
-- ============================================================
create table if not exists public.village_info (
  id uuid primary key default gen_random_uuid(),
  history text,
  introduction text,
  geography text,
  location text,
  climate text,
  population text,
  economy text,
  agriculture text,
  culture text,
  education text,
  healthcare text,
  transportation text,
  tourist_places text,
  institutions text,
  future_plans text,
  map_embed_url text,
  updated_at timestamptz not null default now()
);

alter table public.village_info enable row level security;

drop policy if exists "public_select_village_info" on public.village_info;
create policy "public_select_village_info"
  on public.village_info for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_village_info" on public.village_info;
create policy "auth_insert_village_info"
  on public.village_info for insert
  to authenticated with check (true);

drop policy if exists "auth_update_village_info" on public.village_info;
create policy "auth_update_village_info"
  on public.village_info for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_village_info" on public.village_info;
create policy "auth_delete_village_info"
  on public.village_info for delete
  to authenticated using (true);

drop trigger if exists trg_village_info_updated on public.village_info;
create trigger trg_village_info_updated
  before update on public.village_info
  for each row execute function public.set_updated_at();

-- ============================================================
-- 2. sarpanch
-- ============================================================
create table if not exists public.sarpanch (
  id uuid primary key default gen_random_uuid(),
  photo_url text,
  name text not null,
  contact text,
  email text,
  address text,
  message text,
  term_start date,
  term_end date,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.sarpanch enable row level security;

drop policy if exists "public_select_sarpanch" on public.sarpanch;
create policy "public_select_sarpanch"
  on public.sarpanch for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_sarpanch" on public.sarpanch;
create policy "auth_insert_sarpanch"
  on public.sarpanch for insert
  to authenticated with check (true);

drop policy if exists "auth_update_sarpanch" on public.sarpanch;
create policy "auth_update_sarpanch"
  on public.sarpanch for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_sarpanch" on public.sarpanch;
create policy "auth_delete_sarpanch"
  on public.sarpanch for delete
  to authenticated using (true);

-- ============================================================
-- 3. panchayat_members
-- ============================================================
create table if not exists public.panchayat_members (
  id uuid primary key default gen_random_uuid(),
  photo_url text,
  name text not null,
  ward_number text,
  designation text,
  phone text,
  email text,
  responsibilities text,
  is_committee boolean not null default false,
  is_former boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.panchayat_members enable row level security;

drop policy if exists "public_select_panchayat_members" on public.panchayat_members;
create policy "public_select_panchayat_members"
  on public.panchayat_members for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_panchayat_members" on public.panchayat_members;
create policy "auth_insert_panchayat_members"
  on public.panchayat_members for insert
  to authenticated with check (true);

drop policy if exists "auth_update_panchayat_members" on public.panchayat_members;
create policy "auth_update_panchayat_members"
  on public.panchayat_members for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_panchayat_members" on public.panchayat_members;
create policy "auth_delete_panchayat_members"
  on public.panchayat_members for delete
  to authenticated using (true);

-- ============================================================
-- 4. schemes
-- ============================================================
create table if not exists public.schemes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  description text,
  benefits text,
  eligibility text,
  documents_required text,
  application_process text,
  important_dates text,
  official_link text,
  helpline text,
  pdf_url text,
  status text not null default 'active' check (status in ('active', 'closed')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.schemes enable row level security;

drop policy if exists "public_select_schemes" on public.schemes;
create policy "public_select_schemes"
  on public.schemes for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_schemes" on public.schemes;
create policy "auth_insert_schemes"
  on public.schemes for insert
  to authenticated with check (true);

drop policy if exists "auth_update_schemes" on public.schemes;
create policy "auth_update_schemes"
  on public.schemes for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_schemes" on public.schemes;
create policy "auth_delete_schemes"
  on public.schemes for delete
  to authenticated using (true);

-- ============================================================
-- 5. announcements
-- ============================================================
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  attachment_url text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  is_pinned boolean not null default false,
  start_date date,
  expiry_date date,
  created_by text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

drop policy if exists "public_select_announcements" on public.announcements;
create policy "public_select_announcements"
  on public.announcements for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_announcements" on public.announcements;
create policy "auth_insert_announcements"
  on public.announcements for insert
  to authenticated with check (true);

drop policy if exists "auth_update_announcements" on public.announcements;
create policy "auth_update_announcements"
  on public.announcements for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_announcements" on public.announcements;
create policy "auth_delete_announcements"
  on public.announcements for delete
  to authenticated using (true);

-- ============================================================
-- 6. notices
-- ============================================================
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text,
  file_type text check (file_type in ('pdf', 'jpeg', 'png')),
  category text,
  created_at timestamptz not null default now()
);

alter table public.notices enable row level security;

drop policy if exists "public_select_notices" on public.notices;
create policy "public_select_notices"
  on public.notices for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_notices" on public.notices;
create policy "auth_insert_notices"
  on public.notices for insert
  to authenticated with check (true);

drop policy if exists "auth_update_notices" on public.notices;
create policy "auth_update_notices"
  on public.notices for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_notices" on public.notices;
create policy "auth_delete_notices"
  on public.notices for delete
  to authenticated using (true);

-- ============================================================
-- 7. gallery_albums
-- ============================================================
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  created_at timestamptz not null default now()
);

alter table public.gallery_albums enable row level security;

drop policy if exists "public_select_gallery_albums" on public.gallery_albums;
create policy "public_select_gallery_albums"
  on public.gallery_albums for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_gallery_albums" on public.gallery_albums;
create policy "auth_insert_gallery_albums"
  on public.gallery_albums for insert
  to authenticated with check (true);

drop policy if exists "auth_update_gallery_albums" on public.gallery_albums;
create policy "auth_update_gallery_albums"
  on public.gallery_albums for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_gallery_albums" on public.gallery_albums;
create policy "auth_delete_gallery_albums"
  on public.gallery_albums for delete
  to authenticated using (true);

-- ============================================================
-- 8. gallery_images
-- ============================================================
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums(id) on delete set null,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

drop policy if exists "public_select_gallery_images" on public.gallery_images;
create policy "public_select_gallery_images"
  on public.gallery_images for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_gallery_images" on public.gallery_images;
create policy "auth_insert_gallery_images"
  on public.gallery_images for insert
  to authenticated with check (true);

drop policy if exists "auth_update_gallery_images" on public.gallery_images;
create policy "auth_update_gallery_images"
  on public.gallery_images for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_gallery_images" on public.gallery_images;
create policy "auth_delete_gallery_images"
  on public.gallery_images for delete
  to authenticated using (true);

-- ============================================================
-- 9. contact_submissions
-- ============================================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Public can INSERT only (citizens submit inquiries without signing in)
drop policy if exists "public_insert_contact_submissions" on public.contact_submissions;
create policy "public_insert_contact_submissions"
  on public.contact_submissions for insert
  to anon, authenticated with check (true);

-- Authenticated admins can read and delete submissions
drop policy if exists "auth_select_contact_submissions" on public.contact_submissions;
create policy "auth_select_contact_submissions"
  on public.contact_submissions for select
  to authenticated using (true);

drop policy if exists "auth_delete_contact_submissions" on public.contact_submissions;
create policy "auth_delete_contact_submissions"
  on public.contact_submissions for delete
  to authenticated using (true);

-- ============================================================
-- 10. site_settings (single row)
-- ============================================================
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  logo_url text,
  favicon_url text,
  homepage_banner_url text,
  office_address text,
  phone text,
  email text,
  working_days text,
  lunch_break text,
  public_holidays text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "public_select_site_settings" on public.site_settings;
create policy "public_select_site_settings"
  on public.site_settings for select
  to anon, authenticated using (true);

drop policy if exists "auth_insert_site_settings" on public.site_settings;
create policy "auth_insert_site_settings"
  on public.site_settings for insert
  to authenticated with check (true);

drop policy if exists "auth_update_site_settings" on public.site_settings;
create policy "auth_update_site_settings"
  on public.site_settings for update
  to authenticated using (true) with check (true);

drop policy if exists "auth_delete_site_settings" on public.site_settings;
create policy "auth_delete_site_settings"
  on public.site_settings for delete
  to authenticated using (true);

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_schemes_status on public.schemes(status);
create index if not exists idx_schemes_featured on public.schemes(featured);
create index if not exists idx_schemes_category on public.schemes(category);
create index if not exists idx_announcements_pinned on public.announcements(is_pinned);
create index if not exists idx_announcements_priority on public.announcements(priority);
create index if not exists idx_announcements_expiry on public.announcements(expiry_date);
create index if not exists idx_notices_category on public.notices(category);
create index if not exists idx_notices_created on public.notices(created_at desc);
create index if not exists idx_gallery_images_album on public.gallery_images(album_id);
create index if not exists idx_panchayat_members_ward on public.panchayat_members(ward_number);
create index if not exists idx_panchayat_members_former on public.panchayat_members(is_former);

-- ============================================================
-- Seed default rows for single-row tables
-- ============================================================
insert into public.village_info (id) values (gen_random_uuid())
  on conflict do nothing;

insert into public.site_settings (id) values (gen_random_uuid())
  on conflict do nothing;