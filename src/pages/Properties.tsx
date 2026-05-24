import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Search, MapPin, BedDouble, Bath, Maximize, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const BHK_FILTERS = ['All', '1 BHK', '2 BHK', '3 BHK', 'Villa', 'PG / Hostel', 'Studio'];
const FURNISH_FILTERS = ['All', 'Fully Furnished', 'Semi Furnished', 'Unfurnished'];

export default function Properties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bhkFilter, setBhkFilter] = useState('All');
  const [furnishFilter, setFurnishFilter] = useState('All');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('availability_status', 'Available')
        .order('created_at', { ascending: false });
      if (data) setProperties(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = properties.filter(p => {
    if (bhkFilter !== 'All' && p.type !== bhkFilter) return false;
    if (furnishFilter !== 'All' && p.furnishing_status !== furnishFilter) return false;
    if (budgetMin && p.rent_amount < Number(budgetMin)) return false;
    if (budgetMax && p.rent_amount > Number(budgetMax)) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-light stitch-grid min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">BROWSE LISTINGS</p>
        <h1 className="text-5xl md:text-6xl font-display font-medium tracking-tighter text-navy mb-4">
          Available Properties
        </h1>
        <p className="text-navy/50 text-lg max-w-xl">Find your perfect home in Bangalore. Filter by type, budget, and furnishing preference.</p>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-2xl border border-navy/10 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative md:col-span-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
              <input type="text" placeholder="Search by name or location..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-light border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy" />
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
              <select value={bhkFilter} onChange={e => setBhkFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-light border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy appearance-none font-medium text-navy cursor-pointer">
                {BHK_FILTERS.map(b => <option key={b} value={b}>{b === 'All' ? 'All Types' : b}</option>)}
              </select>
            </div>
            <div>
              <select value={furnishFilter} onChange={e => setFurnishFilter(e.target.value)}
                className="w-full px-4 py-3 bg-light border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy appearance-none font-medium text-navy cursor-pointer">
                {FURNISH_FILTERS.map(f => <option key={f} value={f}>{f === 'All' ? 'All Furnishing' : f}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="number" placeholder="Min ₹" value={budgetMin} onChange={e => setBudgetMin(e.target.value)}
                className="w-1/2 px-3 py-3 bg-light border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy" />
              <input type="number" placeholder="Max ₹" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                className="w-1/2 px-3 py-3 bg-light border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy" />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="text-center py-20 text-navy/50">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-navy/40 text-lg mb-2">No properties match your filters.</p>
            <p className="text-navy/30 text-sm">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-navy/40 font-bold mb-8">{filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/properties/${p.id}`} className="block bg-white rounded-2xl border border-navy/10 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                    <div className="aspect-video bg-navy/5 overflow-hidden">
                      {p.image_urls?.length > 0 ? (
                        <img src={p.image_urls[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy/15">
                          <Maximize size={40} />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.type}</span>
                        <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{p.furnishing_status}</span>
                      </div>
                      <h3 className="font-display font-medium text-navy text-xl mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-xs text-navy/50 flex items-center gap-1 mb-4"><MapPin size={12} /> {p.location}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-display font-medium text-navy">₹{p.rent_amount?.toLocaleString()}<span className="text-xs text-navy/40 font-normal">/mo</span></p>
                        <div className="flex items-center gap-3 text-navy/40 text-xs">
                          <span className="flex items-center gap-1"><BedDouble size={14} /> {p.bedrooms}</span>
                          <span className="flex items-center gap-1"><Bath size={14} /> {p.bathrooms}</span>
                          {p.area_sqft > 0 && <span className="flex items-center gap-1"><Maximize size={14} /> {p.area_sqft}ft²</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
