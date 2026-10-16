import { supabase } from '../../../lib/supabase';
import type { Church } from '../types/church.types';

export async function getChurches(): Promise<Church[]> {
  const { data, error } = await supabase.from('churches').select('*');

  if (error) {
    throw new Error(error.message);
  }

  return (data as Church[]) ?? [];
}