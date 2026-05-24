import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { MapPin, BedDouble, Bath, Maximize, Heart, ArrowLeft } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';

export default function SavedProperties() {
  const { user, loading: authLoading } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data: favs } = await supabase
        .from('user_favorites')
        .select('property_id')
        .eq('user_id', user.id);
      if (!favs || favs.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      const ids = favs.map(f => f.property_id);
      const { data } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);
      if (data) setProperties(data);
      setLoading(false);
    }
    load();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-light stitch-grid flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/properties" replace />;
  }

  return (
    <div className="bg-light stitch-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <Link to="/properties" className="inline-flex items-center gap-2 text-navy/50 hover:text-navy text-xs uppercase tracking-widest font-bold mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to listings
        </Link>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">YOUR COLLECTION</p>
        <h1 className="text-5xl md:text-6xl font-display font-medium tracking-tighter text-navy mb-4">Saved Properties</h1>
        <p className="text-navy/50 text-lg">Properties you've saved for later.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-20 text-navy/50">Loading saved properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={48} className="mx-auto mb-4 text-navy/15" />
            <p className="text-navy/40 text-lg mb-2">No saved properties yet.</p>
            <Link to="/properties" className="text-primary hover:underline text-sm font-bold uppercase tracking-widest">Browse listings →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="bg-white rounded-2xl border border-navy/10 shadow-sm hover:shadow-lg transition-all overflow-hidden group relative">
                  <button onClick={() => toggleFavorite(p.id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer">
                    <Heart size={18} className={isFavorite(p.id) ? 'fill-red-500 text-red-500' : 'text-navy/30'} />
                  </button>
                  <Link to={`/properties/${p.id}`}>
                    <div className="aspect-video bg-navy/5 overflow-hidden">
                      {p.image_urls?.length > 0 ? (
                        <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy/15"><Maximize size={40} /></div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.type}</span>
                        <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.furnishing_status}</span>
                      </div>
                      <h3 className="font-display font-medium text-navy text-xl mb-2">{p.title}</h3>
                      <p className="text-xs text-navy/50 flex items-center gap-1 mb-4"><MapPin size={12} /> {p.location}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-display font-medium text-navy">₹{p.rent_amount?.toLocaleString()}<span className="text-xs text-navy/40 font-normal">/mo</span></p>
                        <div className="flex items-center gap-3 text-navy/40 text-xs">
                          <span className="flex items-center gap-1"><BedDouble size={14} /> {p.bedrooms}</span>
                          <span className="flex items-center gap-1"><Bath size={14} /> {p.bathrooms}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
