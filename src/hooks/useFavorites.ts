import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [user]);

  async function fetchFavorites() {
    const { data } = await supabase
      .from('user_favorites')
      .select('property_id')
      .eq('user_id', user.id);
    if (data) setFavoriteIds(new Set(data.map(f => f.property_id)));
    setLoading(false);
  }

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      toast.error('Sign in to save properties.');
      return;
    }
    const isFav = favoriteIds.has(propertyId);
    if (isFav) {
      setFavoriteIds(prev => { const next = new Set(prev); next.delete(propertyId); return next; });
      await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
      toast.success('Removed from saved.');
    } else {
      setFavoriteIds(prev => new Set(prev).add(propertyId));
      await supabase.from('user_favorites').insert({ user_id: user.id, property_id: propertyId });
      toast.success('Saved to favorites!');
    }
  };

  const isFavorite = (propertyId: string) => favoriteIds.has(propertyId);

  return { favoriteIds, toggleFavorite, isFavorite, loading };
}
