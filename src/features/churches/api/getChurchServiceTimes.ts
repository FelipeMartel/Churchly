import { supabase } from "@/src/lib/supabase";
import type { ServiceTime } from "../types/church.types";

export async function getChurchServiceTimes(churchId: string): Promise<ServiceTime[]> {
  const { data, error } = await supabase
    .from("service_times")
    .select(`
      id,
      church_id,
      day_of_week,
      start_time,
      language,
      notes
    `)
    .eq("church_id", churchId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ServiceTime[];
}