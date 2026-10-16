export type Church = {
  id: string;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  languages: string[] | null
  denomination: string | null;
  city: string | null;
  island: string | null;
  country: string | null;
  website: string | null;
  instagram: string | null;
  phone: string | null;
  verified: boolean | null;
};

export type ServiceTime = {
  id: string;
  church_id: string;
  day_of_week: number;
  start_time: string;
  language: string | null;
  notes: string | null;
};