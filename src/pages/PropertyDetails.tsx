import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { MapPin, BedDouble, Bath, Maximize, ArrowLeft, MessageCircle, Phone, Check, ChevronLeft, ChevronRight, Heart, X, ZoomIn } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      if (data) setProperty(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light stitch-grid flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-light stitch-grid flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-display text-navy">Property not found</p>
        <Link to="/properties" className="text-primary hover:underline text-sm font-bold uppercase tracking-widest">← Back to listings</Link>
      </div>
    );
  }

  const images: string[] = property.image_urls || [];
  const amenities: string[] = property.amenities || [];

  const prevImage = () => setActiveImage(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setActiveImage(i => (i === images.length - 1 ? 0 : i + 1));

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      nextImage();
    } else if (info.offset.x > swipeThreshold) {
      prevImage();
    }
  };

  const waText = encodeURIComponent(`Hi, I'm interested in "${property.title}" at ${property.location}. Can I schedule a visit?`);

  return (
    <div className="bg-light stitch-grid min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        {/* Back */}
        <Link to="/properties" className="inline-flex items-center gap-2 text-navy/50 hover:text-navy text-xs uppercase tracking-widest font-bold mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to listings
        </Link>

        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="mb-10">
            <div 
              className="aspect-video md:aspect-[21/9] bg-navy/5 rounded-2xl overflow-hidden relative group cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              <motion.img
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={images[activeImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn size={48} className="text-white/80" />
              </div>
              {images.length > 1 && (
                <>
                  <button onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ChevronLeft size={20} className="text-navy" />
                  </button>
                  <button onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <ChevronRight size={20} className="text-navy" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((url, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 cursor-pointer shrink-0 transition-all ${
                      i === activeImage ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <span className="text-[10px] bg-navy/5 text-navy px-3 py-1 rounded font-bold uppercase tracking-wider">{property.type}</span>
              <span className="text-[10px] bg-navy/5 text-navy px-3 py-1 rounded font-bold uppercase tracking-wider">{property.furnishing_status}</span>
              {property.availability_status === 'Available' && (
                <span className="text-[10px] bg-green-500 text-white px-3 py-1 rounded font-bold uppercase tracking-wider">Available</span>
              )}
              </div>
              <button onClick={() => property && toggleFavorite(property.id)}
                className="p-2.5 bg-white border border-navy/10 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer">
                <Heart size={20} className={property && isFavorite(property.id) ? 'fill-red-500 text-red-500' : 'text-navy/30'} />
              </button>
            </div>

            <h1 className="text-4xl font-display font-medium tracking-tighter text-navy mb-3">{property.title}</h1>
            <p className="text-navy/50 flex items-center gap-2 mb-8 text-sm"><MapPin size={16} /> {property.location}{property.pincode ? ` — ${property.pincode}` : ''}</p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-10 pb-8 border-b border-navy/10">
              <div className="flex items-center gap-2 text-navy">
                <BedDouble size={20} className="text-navy/40" />
                <div>
                  <p className="text-xl font-display font-medium">{property.bedrooms}</p>
                  <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">Bedrooms</p>
                </div>
              </div>
              <div className="w-px h-10 bg-navy/10" />
              <div className="flex items-center gap-2 text-navy">
                <Bath size={20} className="text-navy/40" />
                <div>
                  <p className="text-xl font-display font-medium">{property.bathrooms}</p>
                  <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">Bathrooms</p>
                </div>
              </div>
              {property.area_sqft > 0 && (
                <>
                  <div className="w-px h-10 bg-navy/10" />
                  <div className="flex items-center gap-2 text-navy">
                    <Maximize size={20} className="text-navy/40" />
                    <div>
                      <p className="text-xl font-display font-medium">{property.area_sqft}</p>
                      <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">Sq. Ft.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">About this property</h3>
                <p className="text-navy/70 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-navy text-sm">
                      <Check size={14} className="text-green-500 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Sticky Action Card */}
          <div>
            <div className="sticky top-8 bg-white rounded-2xl border border-navy/10 p-8 shadow-lg">
              <p className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold mb-2">Monthly Rent</p>
              <p className="text-4xl font-display font-medium text-navy mb-1">₹{property.rent_amount?.toLocaleString()}</p>
              <p className="text-sm text-navy/40 mb-6">Deposit: ₹{(property.deposit_amount || 0).toLocaleString()}</p>

              <div className="space-y-3">
                <a href={`https://wa.me/918886131316?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-primary/80 transition-all shadow-sm">
                  <MessageCircle size={16} /> Schedule a Visit
                </a>
                <a href="tel:+918886131316"
                  className="flex items-center justify-center gap-2 w-full border border-navy/20 text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-navy/5 transition-all">
                  <Phone size={16} /> Call Directly
                </a>
              </div>

              <p className="text-[10px] text-navy/30 text-center mt-6">Quest Housing Bangalore • Trusted Partner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            {/* Lightbox Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pointer-events-none">
              <div className="pointer-events-auto text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold">
                {activeImage + 1} / {images.length}
              </div>
              <button 
                onClick={() => setShowLightbox(false)}
                className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden px-4 md:px-20">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={images[activeImage]}
                alt={property.title}
                className="max-w-full max-h-[85vh] object-contain cursor-grab active:cursor-grabbing shadow-2xl rounded-lg"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
              />
            </div>

            {/* Desktop Arrows */}
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors cursor-pointer z-10 backdrop-blur-sm">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors cursor-pointer z-10 backdrop-blur-sm">
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6 overflow-x-auto pointer-events-none">
                <div className="pointer-events-auto flex gap-2 p-2 bg-black/20 rounded-2xl backdrop-blur-md">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        i === activeImage ? 'border-primary opacity-100' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}>
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
