import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useProperties() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Realtime invalidation
  useEffect(() => {
    const channel = supabase.channel('properties_rq')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['public_properties'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const addProperty = useMutation({
    mutationFn: async (payload: Record<string, any>) => {
      const { data, error } = await supabase.from('properties').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['public_properties'] });
      toast.success('Property added.');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add property.');
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, any> }) => {
      const { data, error } = await supabase.from('properties').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const prev = queryClient.getQueryData(['properties']);
      queryClient.setQueryData(['properties'], (old: any[]) =>
        old?.map(p => p.id === id ? { ...p, ...payload } : p)
      );
      return { prev };
    },
    onError: (_err: any, _vars, context: any) => {
      queryClient.setQueryData(['properties'], context?.prev);
      toast.error('Failed to update property.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['public_properties'] });
      toast.success('Property updated.');
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      const prev = queryClient.getQueryData(['properties']);
      queryClient.setQueryData(['properties'], (old: any[]) =>
        old?.filter(p => p.id !== id)
      );
      return { prev };
    },
    onError: (_err: any, _vars, context: any) => {
      queryClient.setQueryData(['properties'], context?.prev);
      toast.error('Failed to delete property.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['public_properties'] });
      toast.success('Property deleted.');
    },
  });

  return { ...query, addProperty, updateProperty, deleteProperty };
}
