import { supabase } from '../../../lib/supabase';
import type { Church } from '../types/church.types';

export async function getChurchById(id: string): Promise<Church | null> {
  const { data, error } = await supabase
    .from('churches')
    .select(
      'id, name, address, languages, latitude, longitude, denomination, city, island, country, phone, instagram, website, verified'
    )
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}