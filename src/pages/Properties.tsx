import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, ArrowRight } from 'lucide-react';
import { fetchProperties } from '../lib/sanityAPI';

const categories = ["All", "Apartment", "Villa", "Studio", "PG", "Commercial"];
const locations = ["All", "Whitefield", "Koramangala", "HSR Layout", "Marathahalli"];

export default function Properties() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLocation, setActiveLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await fetchProperties();
        const mappedProperties = data.map((prop: any) => ({
          id: prop.id || prop._id,
          name: prop.title,
          type: prop.specs?.split('•')[0]?.trim() || "Property",
          location: prop.location || "Unknown",
          rent: prop.price || "Contact for Price",
          specs: prop.specs || "",
          bedrooms: prop.specs?.match(/(\d+)\s*Bed/i)?.[1] || "—",
          bathrooms: prop.specs?.match(/(\d+)\s*Bath/i)?.[1] || "—",
          image: prop.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80"
        }));
        setProperties(mappedProperties);
      } catch (error) {
        console.error("Failed to fetch properties from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  const filteredProperties = properties.filter(prop => {
    const matchCategory = activeCategory === "All" || prop.type === activeCategory;
    const matchLocation = activeLocation === "All" || prop.location.includes(activeLocation);
    return matchCategory && matchLocation;
  });

  return (
    <div className="w-full pt-32 pb-32 min-h-screen bg-light relative overflow-hidden text-navy stitch-grid">
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-stitch-b pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-navy/50 text-xs uppercase tracking-[0.3em] font-bold mb-6">The Collection</span>
            <h1 className="text-5xl md:text-[80px] font-display font-medium mb-4 uppercase tracking-tighter text-navy flex flex-col pt-8">
              <span className="border-t-8 border-primary w-24 mb-6"></span>
              PORTFOLIO
            </h1>
            <p className="text-xl text-navy/70 font-sans max-w-xl">Curated cinematic living in Bangalore's most sought-after neighborhoods.</p>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-8 py-4 border text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-[4px_4px_0px_rgba(22,27,64,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(22,27,64,1)] ${showFilters ? 'bg-navy text-primary border-navy' : 'bg-white text-navy border-navy'}`}
          >
            <Filter size={16} /> Filters
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden mb-16"
            >
              <div className="bg-white border-stitch p-10 grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
                <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
                <div>
                  <h4 className="text-navy text-xs font-bold uppercase tracking-[0.2em] mb-6 border-stitch-b pb-3">Property Type</h4>
                  <div className="flex flex-wrap gap-3">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-all border ${activeCategory === cat ? 'bg-navy text-primary border-navy' : 'bg-transparent text-navy/70 border-navy/20 hover:border-navy hover:text-navy'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-navy text-xs font-bold uppercase tracking-[0.2em] mb-6 border-stitch-b pb-3">Location</h4>
                  <div className="flex flex-wrap gap-3">
                    {locations.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setActiveLocation(loc)}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] transition-all border ${activeLocation === loc ? 'bg-navy text-primary border-navy' : 'bg-transparent text-navy/70 border-navy/20 hover:border-navy hover:text-navy'}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 pt-8">
          <AnimatePresence mode="popLayout">
            {filteredProperties.map((prop, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                key={prop.id}
                className="group cursor-pointer"
              >
                <Link to={`/properties/${prop.id}`}>
                  <div className="relative aspect-[4/3] mb-8 overflow-hidden bg-white border-stitch p-3">
                    <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
                    <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
                    <div className="w-full h-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-navy/10 z-10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
                      <img 
                        src={prop.image} 
                        alt={prop.name} 
                        className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.05]"
                      />
                      <div className="absolute top-4 right-4 z-20 bg-white border border-navy/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-navy shadow-sm">
                        {prop.type}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-display font-medium mb-3 group-hover:text-primary transition-colors tracking-tighter uppercase">{prop.name}</h3>
                    <p className="text-navy/60 mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold">
                      <MapPin size={14} className="text-primary" /> {prop.location}
                    </p>
                    <div className="flex gap-6 items-center pt-6 border-stitch-b pb-6">
                      <span className="text-2xl font-medium text-navy">{prop.rent}</span>
                      <span className="block w-[1px] h-4 bg-navy/20" />
                      <span className="text-navy/70 text-xs uppercase tracking-[0.2em] font-bold">{prop.bedrooms} Bed &bull; {prop.bathrooms} Bath</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white border-stitch">
              <h3 className="text-4xl font-display text-navy mb-4 uppercase tracking-tighter">No spaces found</h3>
              <p className="text-navy/60 font-sans">Try adjusting your filters to discover more properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
