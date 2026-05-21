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
      {/* Hero Gallery (Cinematic) */}
      <div className="h-[100vh] relative px-6 md:px-12 max-w-[1600px] mx-auto pt-8">
        <div className="absolute inset-0 z-0 flex flex-col md:flex-row shadow-sm border-stitch bg-white m-6 md:m-12 p-3">
          <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
          <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
          <div className="w-full md:w-2/3 h-1/2 md:h-full md:pr-1 relative overflow-hidden group">
             <div className="absolute inset-0 bg-navy/10 z-10 transition-colors duration-700 pointer-events-none" />
            <img src={property.image} alt={property.name} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
          </div>
          <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-row md:flex-col gap-1">
            <div className="w-1/2 md:w-full h-full md:h-1/2 relative overflow-hidden pb-1 md:pb-0 group">
              <div className="absolute inset-0 bg-navy/10 z-10 transition-colors duration-700 pointer-events-none" />
              <img src={property.gallery[0]} alt="" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
            </div>
            <div className="w-1/2 md:w-full h-full md:h-1/2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-navy/10 z-10 transition-colors duration-700 pointer-events-none" />
              <img src={property.gallery[1] || property.image} alt="" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-[1.03]" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-end m-6 md:m-12 p-10 md:p-16 z-20 pointer-events-none bg-gradient-to-t from-navy/80 via-navy/20 to-transparent">
          <div className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link to="/properties" className="inline-flex items-center gap-3 text-white hover:text-primary mb-8 transition-colors text-xs font-bold uppercase tracking-[0.2em] group pointer-events-auto">
                <span className="w-8 h-8 rounded-none border border-white/40 flex items-center justify-center group-hover:border-primary transition-all">
                  <ArrowLeft size={14} />
                </span>
                Back to Collection
              </Link>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div>
                  <div className="inline-block px-4 py-2 bg-white border border-transparent text-navy font-bold text-[10px] uppercase tracking-[0.3em] mb-6 shadow-sm">
                    {property.type} &bull; {property.furnishing}
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium mb-4 tracking-tighter uppercase text-white">{property.name}</h1>
                  <p className="text-xl text-white/80 flex items-center gap-3 font-sans">
                    <MapPin size={20} className="text-primary" /> {property.location}
                  </p>
                </div>
                <div className="text-left md:text-right bg-white p-8 border-stitch pointer-events-auto shadow-xl relative min-w-[300px]">
                  <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-2">Monthly Rent</p>
                  <p className="text-4xl md:text-5xl font-display text-navy tracking-tighter">{property.rent}</p>
                </div>
              </div>
            </motion.div>
          </div>
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
