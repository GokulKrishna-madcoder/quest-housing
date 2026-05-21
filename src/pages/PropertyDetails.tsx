import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Maximize2, BedDouble, Bath, Check, ArrowLeft } from 'lucide-react';
import { fetchPropertyById } from '../lib/sanityAPI';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        const data = await fetchPropertyById(id);
        if (data) {
          setProperty({
            id: data.id || data._id,
            name: data.title,
            type: data.specs?.propertyType || "Property",
            location: data.location || "Unknown",
            rent: data.price || "Contact for Price",
            bedrooms: data.specs?.bedrooms || "—",
            bathrooms: data.specs?.bathrooms || "—",
            area: data.specs?.area ? `${data.specs.area} sqft` : "TBD",
            furnishing: data.specs?.furnishing || "As Listed",
            description: data.description || "No description provided.",
            features: data.amenities || [],
            image: data.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
            gallery: [
              data.image2 || data.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
              data.image3 || data.image2 || data.image || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80",
            ]
          });
        }
      } catch (error) {
        console.error("Failed to fetch property details:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-light text-navy stitch-grid">
        <div className="text-center font-bold text-xs uppercase tracking-widest text-navy animate-pulse">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-light text-navy stitch-grid">
        <div className="text-center bg-white p-16 border-stitch shadow-sm relative">
          <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
          <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
          <h2 className="text-4xl font-display mb-4 uppercase tracking-tighter">Property Not Found</h2>
          <Link to="/properties" className="text-primary hover:text-navy text-xs uppercase tracking-[0.2em] font-bold transition-colors">Return to Collection</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-32 bg-light relative selection:bg-primary selection:text-navy text-navy stitch-grid pt-24">
      {/* Hero Gallery (Cinematic Stitch Layout) */}
      <div className="min-h-[100vh] relative px-4 md:px-12 max-w-[1600px] mx-auto pt-4 md:pt-8">
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-3 bg-white border-stitch p-3 shadow-sm relative">
          {/* Corner stitch marks */}
          <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
          <div className="cross-mark top-0 right-0 translate-x-1/2 -translate-y-1/2 text-navy"></div>
          <div className="cross-mark bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-navy"></div>
          <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>

          {/* Main Image (Left — contains text overlay) */}
          <div className="w-full md:w-2/3 h-1/2 md:h-full relative overflow-hidden group">
            <img src={property.image} alt={property.name} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            
            {/* Gradient overlay — constrained to main image only */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent pointer-events-none" />

            {/* Text content — inside main image */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 lg:p-14 z-20">
              {/* Top: Back button */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Link to="/properties" className="inline-flex items-center gap-3 text-white hover:text-primary transition-colors text-xs font-bold uppercase tracking-[0.2em] group/back">
                  <span className="w-8 h-8 border border-white/40 flex items-center justify-center group-hover/back:border-primary group-hover/back:bg-primary/10 transition-all">
                    <ArrowLeft size={14} />
                  </span>
                  Back to Collection
                </Link>
              </motion.div>

              {/* Bottom: Property info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-2xl"
              >
                <div className="inline-block px-4 py-2 bg-white text-navy font-bold text-[10px] uppercase tracking-[0.3em] mb-5 shadow-sm">
                  {property.type} &bull; {property.furnishing}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium mb-4 tracking-tighter uppercase text-white leading-[1.05]">{property.name}</h1>
                <p className="text-lg text-white/80 flex items-center gap-3 font-sans">
                  <MapPin size={18} className="text-primary shrink-0" /> {property.location}
                </p>
              </motion.div>
            </div>

            {/* Monthly Rent Card — anchored bottom-right of main image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 bg-white p-6 md:p-8 border-stitch shadow-xl text-right min-w-[200px] md:min-w-[260px] hidden md:block"
            >
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-2">Monthly Rent</p>
              <p className="text-3xl md:text-4xl font-display text-navy tracking-tighter">{property.rent}</p>
            </motion.div>
          </div>

          {/* Gallery Images (Right column) */}
          <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-row md:flex-col gap-3">
            <div className="w-1/2 md:w-full h-full md:h-1/2 relative overflow-hidden group border border-navy/5">
              <img src={property.gallery[0]} alt="" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            </div>
            <div className="w-1/2 md:w-full h-full md:h-1/2 relative overflow-hidden group border border-navy/5">
              <img src={property.gallery[1] || property.image} alt="" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-navy/10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Rent Card — visible only on small screens */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="md:hidden bg-white p-6 border-stitch shadow-sm text-center relative"
          >
            <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-2">Monthly Rent</p>
            <p className="text-3xl font-display text-navy tracking-tighter">{property.rent}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-12 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-8"
          >
            {/* Quick Stats Bento */}
            <div className="grid grid-cols-3 gap-[1px] mb-20 bg-navy/10 border-stitch relative shadow-sm">
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
              <div className="text-center py-10 px-4 bg-white hover:bg-light transition-colors">
                <BedDouble size={28} className="mx-auto text-navy/40 mb-4" />
                <p className="text-4xl font-display font-medium text-navy mb-2">{property.bedrooms}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-bold">Bedrooms</p>
              </div>
              <div className="text-center py-10 px-4 bg-white hover:bg-light transition-colors">
                <Bath size={28} className="mx-auto text-navy/40 mb-4" />
                <p className="text-4xl font-display font-medium text-navy mb-2">{property.bathrooms}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-bold">Bathrooms</p>
              </div>
              <div className="text-center py-10 px-4 bg-white hover:bg-light transition-colors">
                <Maximize2 size={28} className="mx-auto text-navy/40 mb-4" />
                <p className="text-4xl font-display font-medium text-navy mb-2">{property.area}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-bold">Square Feet</p>
              </div>
            </div>

            <div className="mb-20">
              <h3 className="text-4xl font-display font-medium mb-8 flex items-center gap-4 uppercase tracking-tighter border-stitch-b pb-6">
                About this Space
              </h3>
              <p className="text-xl text-navy/70 leading-relaxed font-sans max-w-3xl">
                {property.description}
              </p>
            </div>

            <div>
              <h3 className="text-4xl font-display font-medium mb-10 flex items-center gap-4 uppercase tracking-tighter border-stitch-b pb-6">
                Premium Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-5 border border-navy/10 bg-white hover:border-navy/30 transition-colors shadow-sm">
                    <div className="w-8 h-8 bg-navy flex items-center justify-center text-primary shrink-0">
                      <Check size={14} />
                    </div>
                    <span className="text-navy/80 font-sans font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-32 bg-white border-stitch p-10 shadow-sm relative">
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
              <div className="w-16 h-16 bg-navy flex items-center justify-center text-primary font-display font-medium text-3xl mb-8">
                Q
              </div>
              <h3 className="text-4xl font-display font-medium mb-3 uppercase tracking-tighter">Request a Tour</h3>
              <p className="text-navy/50 mb-10 font-sans text-sm">Schedule a cinematic viewing or express interest with our concierge team.</p>
              
              <Link 
                to="/register" 
                state={{ intent: `Interested in ${property.name}` }}
                className="w-full flex items-center justify-center gap-3 py-5 bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] transform transition-all shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)] mb-6"
              >
                Inquire Now
              </Link>
              
              <a 
                href={`https://wa.me/919876543210?text=I'm interested in ${property.name} located at ${property.location}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-3 py-5 bg-transparent border-2 border-navy text-navy font-bold uppercase text-xs tracking-[0.2em] hover:bg-light transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Chat on WhatsApp
              </a>
              
              <div className="mt-10 pt-8 border-stitch-b flex items-start gap-4">
                 <div className="w-10 h-10 bg-light flex items-center justify-center text-navy shrink-0 border border-navy/10">
                    <Check size={14} />
                 </div>
                <p className="text-[10px] text-navy/60 leading-relaxed uppercase tracking-[0.2em] font-bold">
                  Quest Housing Verified.<br/>
                  <span className="text-navy">100% Scam-Free Guarantee.</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
