import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useFunnelLeads() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['funnel_leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Realtime invalidation
  useEffect(() => {
    const channel = supabase.channel('funnel_leads_rq')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_leads' }, () => {
        queryClient.invalidateQueries({ queryKey: ['funnel_leads'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('instagram_leads').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['funnel_leads'] });
      const prev = queryClient.getQueryData(['funnel_leads']);
      queryClient.setQueryData(['funnel_leads'], (old: any[]) =>
        old?.map(lead => lead.id === id ? { ...lead, status } : lead)
      );
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      queryClient.setQueryData(['funnel_leads'], context?.prev);
      toast.error('Failed to update status');
    },
    onSuccess: () => toast.success('Status updated'),
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('instagram_leads').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['funnel_leads'] });
      const prev = queryClient.getQueryData(['funnel_leads']);
      queryClient.setQueryData(['funnel_leads'], (old: any[]) =>
        old?.filter(lead => lead.id !== id)
      );
      return { prev };
    },
    onError: (_err, _vars, context: any) => {
      queryClient.setQueryData(['funnel_leads'], context?.prev);
      toast.error('Failed to delete lead');
    },
    onSuccess: () => toast.success('Lead deleted'),
  });

  return { ...query, updateStatus, deleteLead };
}
