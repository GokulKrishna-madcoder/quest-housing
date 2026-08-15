import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function usePublicProperties() {
  return useQuery({
    queryKey: ['public_properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('availability_status', 'Available')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60 * 1000, // 1 minute cache for public page
  });
}
