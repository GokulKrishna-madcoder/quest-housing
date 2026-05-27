import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { MapPin, BedDouble, Bath, Maximize, ArrowLeft, MessageCircle, Phone, Check, ChevronLeft, ChevronRight, Heart, X, ZoomIn, Calendar, Shield, Star, Clock, Loader2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useFavorites } from '../hooks/useFavorites';
import { useTracker } from '../hooks/useTracker';
import { toast } from 'sonner';
import SEO from '../components/SEO';
import ResponsiveImage from '../components/ResponsiveImage';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitStep, setVisitStep] = useState(1);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [preferredTime, setPreferredTime] = useState('morning');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackEvent } = useTracker();

  useEffect(() => {
    async function load() {
      if (!id) return;
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      if (data) {
        setProperty(data);
        trackEvent('property_view', { property_id: id, title: data.title });
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleVisitSubmit = async () => {
    if (!property || selectedDates.length === 0 || !visitorName || !visitorPhone) return;
    setSubmitting(true);
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const { error } = await supabase.from('visit_slots').insert({
      property_id: property.id,
      lead_name: visitorName,
      lead_phone: visitorPhone,
      preferred_date_1: format(sorted[0], 'yyyy-MM-dd'),
      preferred_date_2: sorted[1] ? format(sorted[1], 'yyyy-MM-dd') : null,
      preferred_date_3: sorted[2] ? format(sorted[2], 'yyyy-MM-dd') : null,
      preferred_time: preferredTime,
    });
    if (error) {
      toast.error('Failed to schedule visit: ' + error.message);
      setSubmitting(false);
      return;
    }
    trackEvent('visit_requested', { property_id: property.id, dates: selectedDates.length });
    toast.success('Visit request submitted! We\'ll confirm your slot shortly.');
    setShowVisitModal(false);
    setVisitStep(1);
    setSelectedDates([]);
    setSubmitting(false);
  };

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

  const images: string[] = property.images || [];
  const amenities: string[] = property.amenities || [];
  const verificationBadge = property.verification_type || 'unverified';
  const isVerified = verificationBadge !== 'unverified';

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

  const waText = encodeURIComponent(`Hi, I'm interested in "${property.title}" at ${property.locality || property.city}. Can I schedule a visit?`);

  return (
    <div className="bg-light stitch-grid min-h-screen">
      <SEO
        title={`${property.type} for rent in ${property.locality || property.city}`}
        description={`Check out this ${property.bhk} BHK ${property.type} available for rent in ${property.locality || property.city} for ₹${property.price?.toLocaleString()}.`}
        image={images.length > 0 ? images[0] : undefined}
      />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        <Link to="/properties" className="inline-flex items-center gap-2 text-navy/50 hover:text-navy text-xs uppercase tracking-widest font-bold mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to listings
        </Link>

        {isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-3"
          >
            <Shield size={20} className="text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">
                {verificationBadge === 'premium' ? 'Premium Managed' : 'Verified by Quest'}
              </p>
              <p className="text-xs text-green-600">This listing has been verified by our team.</p>
            </div>
          </motion.div>
        )}

        {property.featured && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3"
          >
            <Star size={20} className="text-yellow-600 shrink-0" />
            <p className="text-sm font-bold text-yellow-800">Featured Property — Top Pick by Quest Housing</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
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
                      <button onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <ChevronLeft size={20} className="text-navy" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); nextImage(); }}
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
                        <ResponsiveImage src={url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-navy/5 text-navy px-3 py-1 rounded font-bold uppercase tracking-wider">{property.type}</span>
                <span className="text-[10px] bg-navy/5 text-navy px-3 py-1 rounded font-bold uppercase tracking-wider">{property.furnishing}</span>
                {property.admin_status === 'approved' && (
                  <span className="text-[10px] bg-green-500 text-white px-3 py-1 rounded font-bold uppercase tracking-wider">Available</span>
                )}
                {isVerified && (
                  <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                    <Shield size={10} /> Verified
                  </span>
                )}
              </div>
              <button onClick={() => property && toggleFavorite(property.id)}
                className="p-2.5 bg-white border border-navy/10 rounded-full shadow-sm hover:scale-110 transition-transform cursor-pointer">
                <Heart size={20} className={property && isFavorite(property.id) ? 'fill-red-500 text-red-500' : 'text-navy/30'} />
              </button>
            </div>

            <h1 className="text-4xl font-display font-medium tracking-tighter text-navy mb-3">{property.title}</h1>
            <p className="text-navy/50 flex items-center gap-2 mb-8 text-sm"><MapPin size={16} /> {property.locality || property.city}{property.pincode ? ` — ${property.pincode}` : ''}</p>

            <div className="flex items-center gap-8 mb-10 pb-8 border-b border-navy/10">
              <div className="flex items-center gap-2 text-navy">
                <BedDouble size={20} className="text-navy/40" />
                <div>
                  <p className="text-xl font-display font-medium">{property.bhk}</p>
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
              {property.area > 0 && (
                <>
                  <div className="w-px h-10 bg-navy/10" />
                  <div className="flex items-center gap-2 text-navy">
                    <Maximize size={20} className="text-navy/40" />
                    <div>
                      <p className="text-xl font-display font-medium">{property.area}</p>
                      <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">Sq. Ft.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {property.description && (
              <div className="mb-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">About this property</h3>
                <p className="text-navy/70 leading-relaxed">{property.description}</p>
              </div>
            )}

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

          <div>
            <div className="sticky top-8 bg-white rounded-2xl border border-navy/10 p-8 shadow-lg">
              <p className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold mb-2">Monthly Rent</p>
              <p className="text-4xl font-display font-medium text-navy mb-1">₹{property.price?.toLocaleString()}</p>
              <p className="text-sm text-navy/40 mb-6">Deposit: ₹{(property.deposit || 0).toLocaleString()}</p>

              <div className="space-y-3">
                <button
                  onClick={() => setShowVisitModal(true)}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-primary/80 transition-all shadow-sm cursor-pointer"
                >
                  <Calendar size={16} /> Schedule a Visit
                </button>
                <a href={`https://wa.me/918886131316?text=${waText}`} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackEvent('whatsapp_opened', { property_id: id })}
                  className="flex items-center justify-center gap-2 w-full border border-navy/20 text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-navy/5 transition-all">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a href="tel:+918886131316"
                  className="flex items-center justify-center gap-2 w-full border border-navy/20 text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-navy/5 transition-all">
                  <Phone size={16} /> Call Directly
                </a>
              </div>

              {isVerified && (
                <div className="mt-6 pt-6 border-t border-navy/10">
                  <div className="flex items-center gap-2 text-sm text-navy/60">
                    <Shield size={16} className="text-green-500" />
                    <span className="font-bold">Trust Badge:</span> {verificationBadge === 'premium' ? 'Premium Managed' : 'Verified by Quest'}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-navy/30 text-center mt-6">Quest Housing Bangalore • Trusted Partner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visit Booking Modal */}
      <AnimatePresence>
        {showVisitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !submitting && setShowVisitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-navy/10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-medium text-navy">Schedule a Visit</h3>
                  <p className="text-xs text-navy/50 mt-1">{property.title}</p>
                </div>
                <button
                  onClick={() => { if (!submitting) { setShowVisitModal(false); setVisitStep(1); setSelectedDates([]); } }}
                  className="p-2 hover:bg-navy/5 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} className="text-navy/40" />
                </button>
              </div>

              <div className="p-6">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        visitStep >= step ? 'bg-primary text-navy' : 'bg-navy/5 text-navy/30'
                      }`}>{step}</div>
                      {step < 3 && <div className={`w-8 h-px ${visitStep > step ? 'bg-primary' : 'bg-navy/10'}`} />}
                    </div>
                  ))}
                </div>

                {visitStep === 1 && (
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block">Your Name *</label>
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-white border border-navy/10 text-navy text-sm p-3 rounded-xl focus:border-primary focus:outline-none placeholder:text-navy/30"
                    />
                    <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block">Phone Number *</label>
                    <input
                      type="tel"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="+91"
                      className="w-full bg-white border border-navy/10 text-navy text-sm p-3 rounded-xl focus:border-primary focus:outline-none placeholder:text-navy/30"
                    />
                    <button
                      onClick={() => setVisitStep(2)}
                      disabled={!visitorName.trim() || !visitorPhone.trim()}
                      className="w-full bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-30"
                    >
                      Continue
                    </button>
                  </div>
                )}

                {visitStep === 2 && (
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block">
                      Select 3 Preferred Dates *
                    </label>
                    <div className="flex justify-center">
                      <DayPicker
                        mode="multiple"
                        min={1}
                        max={3}
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        disabled={{ before: new Date() }}
                        className="!font-sans"
                        modifiersStyles={{
                          selected: { backgroundColor: '#161B40', color: 'white', borderRadius: '8px' },
                          today: { border: '2px solid #D9C8A9' },
                        }}
                      />
                    </div>
                    <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block">Preferred Time</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'morning', label: 'Morning (9-12)' },
                        { value: 'afternoon', label: 'Afternoon (12-4)' },
                        { value: 'evening', label: 'Evening (4-7)' },
                      ].map(t => (
                        <button
                          key={t.value}
                          onClick={() => setPreferredTime(t.value)}
                          className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            preferredTime === t.value
                              ? 'bg-navy text-white'
                              : 'bg-navy/5 text-navy/60 hover:bg-navy/10'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setVisitStep(3)}
                      disabled={selectedDates.length === 0}
                      className="w-full bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 rounded-xl hover:bg-navy/90 transition-colors disabled:opacity-30"
                    >
                      Review & Submit
                    </button>
                  </div>
                )}

                {visitStep === 3 && (
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block">Review Your Request</label>
                    <div className="bg-navy/5 rounded-xl p-4 space-y-2">
                      <p className="text-sm text-navy"><span className="font-bold">Name:</span> {visitorName}</p>
                      <p className="text-sm text-navy"><span className="font-bold">Phone:</span> {visitorPhone}</p>
                      <p className="text-sm text-navy"><span className="font-bold">Dates:</span> {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map(d => format(d, 'dd MMM')).join(', ')}</p>
                      <p className="text-sm text-navy"><span className="font-bold">Time:</span> {preferredTime}</p>
                    </div>
                    <button
                      onClick={handleVisitSubmit}
                      disabled={submitting}
                      className="w-full bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 rounded-xl hover:bg-primary/80 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                      {submitting ? 'Submitting...' : 'Confirm Visit'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
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

            {images.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-6 overflow-x-auto pointer-events-none">
                <div className="pointer-events-auto flex gap-2 p-2 bg-black/20 rounded-2xl backdrop-blur-md">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        i === activeImage ? 'border-primary opacity-100' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}>
                      <ResponsiveImage src={url} alt="" className="w-full h-full object-cover" />
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
