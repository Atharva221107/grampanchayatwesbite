export interface VillageInfo {
  id: string;
  history: string | null;
  introduction: string | null;
  geography: string | null;
  location: string | null;
  climate: string | null;
  population: string | null;
  economy: string | null;
  agriculture: string | null;
  culture: string | null;
  education: string | null;
  healthcare: string | null;
  transportation: string | null;
  tourist_places: string | null;
  institutions: string | null;
  future_plans: string | null;
  map_embed_url: string | null;
  history_mr: string | null;
  introduction_mr: string | null;
  geography_mr: string | null;
  location_mr: string | null;
  climate_mr: string | null;
  population_mr: string | null;
  economy_mr: string | null;
  agriculture_mr: string | null;
  culture_mr: string | null;
  education_mr: string | null;
  healthcare_mr: string | null;
  transportation_mr: string | null;
  tourist_places_mr: string | null;
  institutions_mr: string | null;
  future_plans_mr: string | null;
  updated_at: string;
}

export interface Sarpanch {
  id: string;
  photo_url: string | null;
  name: string;
  contact: string | null;
  email: string | null;
  address: string | null;
  message: string | null;
  message_mr: string | null;
  term_start: string | null;
  term_end: string | null;
  is_current: boolean;
  created_at: string;
}

export interface PanchayatMember {
  id: string;
  photo_url: string | null;
  name: string;
  ward_number: string | null;
  designation: string | null;
  phone: string | null;
  email: string | null;
  responsibilities: string | null;
  responsibilities_mr: string | null;
  is_committee: boolean;
  is_former: boolean;
  created_at: string;
}

export type SchemeStatus = 'active' | 'closed';

export interface Scheme {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  benefits: string | null;
  eligibility: string | null;
  documents_required: string | null;
  application_process: string | null;
  important_dates: string | null;
  official_link: string | null;
  helpline: string | null;
  pdf_url: string | null;
  status: SchemeStatus;
  featured: boolean;
  name_mr: string | null;
  description_mr: string | null;
  benefits_mr: string | null;
  eligibility_mr: string | null;
  created_at: string;
}

export type AnnouncementPriority = 'low' | 'medium' | 'high';

export interface Announcement {
  id: string;
  title: string;
  title_mr: string | null;
  description: string | null;
  description_mr: string | null;
  image_url: string | null;
  attachment_url: string | null;
  priority: AnnouncementPriority;
  is_pinned: boolean;
  start_date: string | null;
  expiry_date: string | null;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
}

export type NoticeFileType = 'pdf' | 'jpeg' | 'png';

export interface Notice {
  id: string;
  title: string;
  title_mr: string | null;
  description: string | null;
  description_mr: string | null;
  file_url: string | null;
  file_type: NoticeFileType | null;
  category: string | null;
  created_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: string | null;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  album_id: string | null;
  image_url: string;
  caption: string | null;
  caption_mr: string | null;
  created_at: string;
  album?: GalleryAlbum | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  favicon_url: string | null;
  homepage_banner_url: string | null;
  office_address: string | null;
  phone: string | null;
  email: string | null;
  working_days: string | null;
  lunch_break: string | null;
  public_holidays: string | null;
  office_address_mr: string | null;
  working_days_mr: string | null;
  lunch_break_mr: string | null;
  public_holidays_mr: string | null;
  stat_population: string | null;
  stat_wards: string | null;
  stat_schools: string | null;
  stat_hospitals: string | null;
  stat_anganwadi_centers: string | null;
  stat_area: string | null;
  stat_major_crops: string | null;
  updated_at: string;
}

export type Insert<T> = { [K in keyof T]?: T[K] };
export type Update<T> = { [K in keyof T]?: T[K] };
