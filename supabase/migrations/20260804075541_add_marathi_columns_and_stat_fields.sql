/*
# Add Marathi (_mr) Translation Columns + Homepage Stat Fields

## Overview
Adds optional Marathi-language translation columns (`_mr` suffix) to content
tables so admins can enter bilingual content. Also adds homepage quick-stat
fields to site_settings. All new columns are nullable (optional) so existing
data is unaffected.

## New Columns

### announcements
- title_mr (text) — Marathi title
- description_mr (text) — Marathi description

### schemes
- name_mr (text) — Marathi scheme name
- description_mr (text) — Marathi description
- benefits_mr (text) — Marathi benefits
- eligibility_mr (text) — Marathi eligibility

### village_info
- history_mr (text) — Marathi history
- introduction_mr (text) — Marathi introduction
- geography_mr (text) — Marathi geography
- location_mr (text) — Marathi location
- climate_mr (text) — Marathi climate
- population_mr (text) — Marathi population
- economy_mr (text) — Marathi economy
- agriculture_mr (text) — Marathi agriculture
- culture_mr (text) — Marathi culture
- education_mr (text) — Marathi education
- healthcare_mr (text) — Marathi healthcare
- transportation_mr (text) — Marathi transportation
- tourist_places_mr (text) — Marathi tourist places
- institutions_mr (text) — Marathi institutions
- future_plans_mr (text) — Marathi future plans

### notices
- title_mr (text) — Marathi title
- description_mr (text) — Marathi description

### gallery_images
- caption_mr (text) — Marathi caption

### panchayat_members
- responsibilities_mr (text) — Marathi responsibilities

### sarpanch
- message_mr (text) — Marathi message

### site_settings (translations)
- office_address_mr (text) — Marathi office address
- working_days_mr (text) — Marathi working days
- lunch_break_mr (text) — Marathi lunch break
- public_holidays_mr (text) — Marathi public holidays

### site_settings (homepage stat fields)
- stat_population (text) — Population display value
- stat_wards (text) — Number of wards display value
- stat_schools (text) — Number of schools display value
- stat_hospitals (text) — Number of hospitals display value
- stat_anganwadi_centers (text) — Number of anganwadi centers
- stat_area (text) — Area display value
- stat_major_crops (text) — Major crops display value

## Security
No new tables. No policy changes needed — existing RLS policies cover the
new columns automatically (column-level RLS is not enabled).

## Notes
- All new columns are nullable so existing rows and inserts are unaffected.
- Uses DO $$ ... IF NOT EXISTS ... END $$ blocks for idempotency.
- safe to re-run.
*/

-- ============================================================
-- announcements: title_mr, description_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'title_mr') THEN
    ALTER TABLE public.announcements ADD COLUMN title_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'announcements' AND column_name = 'description_mr') THEN
    ALTER TABLE public.announcements ADD COLUMN description_mr text;
  END IF;
END $$;

-- ============================================================
-- schemes: name_mr, description_mr, benefits_mr, eligibility_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'name_mr') THEN
    ALTER TABLE public.schemes ADD COLUMN name_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'description_mr') THEN
    ALTER TABLE public.schemes ADD COLUMN description_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'benefits_mr') THEN
    ALTER TABLE public.schemes ADD COLUMN benefits_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schemes' AND column_name = 'eligibility_mr') THEN
    ALTER TABLE public.schemes ADD COLUMN eligibility_mr text;
  END IF;
END $$;

-- ============================================================
-- village_info: _mr for all text fields
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'history_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN history_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'introduction_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN introduction_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'geography_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN geography_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'location_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN location_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'climate_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN climate_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'population_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN population_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'economy_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN economy_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'agriculture_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN agriculture_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'culture_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN culture_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'education_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN education_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'healthcare_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN healthcare_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'transportation_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN transportation_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'tourist_places_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN tourist_places_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'institutions_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN institutions_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'village_info' AND column_name = 'future_plans_mr') THEN
    ALTER TABLE public.village_info ADD COLUMN future_plans_mr text;
  END IF;
END $$;

-- ============================================================
-- notices: title_mr, description_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notices' AND column_name = 'title_mr') THEN
    ALTER TABLE public.notices ADD COLUMN title_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notices' AND column_name = 'description_mr') THEN
    ALTER TABLE public.notices ADD COLUMN description_mr text;
  END IF;
END $$;

-- ============================================================
-- gallery_images: caption_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_images' AND column_name = 'caption_mr') THEN
    ALTER TABLE public.gallery_images ADD COLUMN caption_mr text;
  END IF;
END $$;

-- ============================================================
-- panchayat_members: responsibilities_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'panchayat_members' AND column_name = 'responsibilities_mr') THEN
    ALTER TABLE public.panchayat_members ADD COLUMN responsibilities_mr text;
  END IF;
END $$;

-- ============================================================
-- sarpanch: message_mr
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sarpanch' AND column_name = 'message_mr') THEN
    ALTER TABLE public.sarpanch ADD COLUMN message_mr text;
  END IF;
END $$;

-- ============================================================
-- site_settings: translation columns
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'office_address_mr') THEN
    ALTER TABLE public.site_settings ADD COLUMN office_address_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'working_days_mr') THEN
    ALTER TABLE public.site_settings ADD COLUMN working_days_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'lunch_break_mr') THEN
    ALTER TABLE public.site_settings ADD COLUMN lunch_break_mr text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'public_holidays_mr') THEN
    ALTER TABLE public.site_settings ADD COLUMN public_holidays_mr text;
  END IF;
END $$;

-- ============================================================
-- site_settings: homepage stat fields
-- ============================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_population') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_population text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_wards') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_wards text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_schools') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_schools text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_hospitals') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_hospitals text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_anganwadi_centers') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_anganwadi_centers text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_area') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_area text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'stat_major_crops') THEN
    ALTER TABLE public.site_settings ADD COLUMN stat_major_crops text;
  END IF;
END $$;