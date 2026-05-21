import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, MapPin, Users, ChevronRight, ChevronLeft, Plus, Home as HomeIcon, Headset, Search, ClipboardList, Sparkles, ShieldCheck } from 'lucide-react';
import { testimonials } from '../data';
import { useRef, useState, useEffect } from 'react';
import { fetchFeaturedProperties } from '../lib/sanityAPI';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await fetchFeaturedProperties();
        const mappedProperties = data.map((prop: any) => ({
          id: prop.id || prop._id,
          name: prop.title,
          type: prop.specs?.propertyType || "Property",
          location: prop.location || "Unknown",
          rent: prop.price || "Contact for Price",
          bedrooms: prop.specs?.bedrooms || "—",
          bathrooms: prop.specs?.bathrooms || "—",
          image: prop.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
          amenities: prop.amenities || []
        }));
        setFeaturedProperties(mappedProperties);
      } catch (error) {
        console.error("Failed to fetch featured properties from Sanity:", error);
      }
    }
    loadFeatured();
  }, []);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const scrollProperties = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth > 768 ? window.innerWidth * 0.5 : window.innerWidth * 0.85;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full flex-col flex overflow-hidden bg-light text-navy">
      
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[100vh] w-full flex flex-col justify-end pt-32 pb-16 overflow-hidden bg-navy-dark group">
        
        {/* Cinematic Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2600" 
             alt="Luxury Cinematic Property" 
             className="w-full h-full object-cover scale-105 transition-transform duration-[4s] ease-out group-hover:scale-100"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-navy-dark/30" />
           <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/20 to-transparent" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center hidden md:flex items-start mb-auto"
        >
          <div className="flex items-center gap-4">
            <span className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-lg">
              Curated Bangalore Living
            </span>
            <span className="bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary px-5 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] shadow-lg">
              Exclusive
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(247,209,18,0.8)]" />
            <span className="text-white/60 text-[10px] font-mono tracking-[0.3em] uppercase">
              EST. 2026 // PREMIUM SPACES
            </span>
          </div>
        </motion.div>

        {/* Main Hero Content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row justify-between items-end gap-12 mt-24">
          
          <motion.div 
             initial="hidden"
             animate="visible"
             variants={staggerContainer}
             className="max-w-4xl lg:max-w-5xl w-full"
          >
            <motion.h1 variants={fadeUp} className="text-6xl sm:text-8xl md:text-[110px] lg:text-[140px] font-display font-black text-white leading-[0.85] tracking-tighter mb-8 xl:whitespace-nowrap">
              <span className="tracking-wide">Find Your</span> <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white font-medium inline-block mt-2 md:mt-4 tracking-tighter pr-4">Perfect Home</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl md:text-3xl text-white/80 max-w-2xl font-sans font-light leading-relaxed mb-12">
              Immersive spaces designed for better living. Discover an exclusive collection of architectural masterpieces.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-5">
               <Link to="/properties" className="bg-primary hover:bg-white text-navy px-10 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-[0_8px_30px_rgba(247,209,18,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 text-center flex justify-center items-center gap-3 w-full sm:w-auto">
                  Explore Properties
                  <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center">
                    <ArrowRight size={14} />
                  </div>
               </Link>
               <Link to="/register" className="bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 text-white px-10 py-5 rounded-full font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex justify-center items-center gap-2 w-full sm:w-auto">
                  Register as Owner
               </Link>
               <Link to="/register" state={{ intent: "Tenant Requirement" }} className="bg-white/10 hover:bg-primary hover:text-navy backdrop-blur-2xl border border-primary/40 text-primary px-10 py-5 rounded-full font-bold uppercase text-xs tracking-[0.2em] shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex justify-center items-center gap-3 w-full sm:w-auto">
                  <ClipboardList size={16} />
                  Tenants Share Your Requirement
               </Link>
            </motion.div>
          </motion.div>

          {/* Floating Glassmorphism Grid */}
          <div className="flex flex-col gap-5 w-full md:w-auto pb-4">
             {/* Stat Card */}
             <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-7 text-white w-full md:w-[340px] shadow-2xl relative overflow-hidden group hover:border-white/20 transition-colors duration-500"
             >
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2" />
               <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white shadow-inner">
                     <MapPin size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-1">Prime Locations</p>
                     <p className="font-display text-2xl md:text-3xl font-medium tracking-tight">Across Bangalore</p>
                  </div>
               </div>
               <div className="h-[1px] w-full bg-white/10 mb-6 relative z-10" />
               <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-navy shadow-[0_0_20px_rgba(247,209,18,0.4)]">
                     <Shield size={20} className="fill-navy" />
                  </div>
                  <div>
                     <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-1">Assurance</p>
                     <p className="font-display text-2xl md:text-3xl font-medium tracking-tight">100% Verified</p>
                  </div>
               </div>
             </motion.div>

          </div>
        </div>
      </section>

      {/* Featured Properties (DARK) */}
      <section className="py-32 bg-navy-dark relative overflow-hidden stitch-grid-dark text-white">
        <div className="container mx-auto px-6 md:px-12 mb-16 relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-4">
              <span className="text-white/50 text-xs uppercase tracking-[0.3em] font-bold border-stitch-b-dark pb-2 pr-8">The Portfolio</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter text-white">Curated Living</motion.h2>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4"
          >
            <div className="flex gap-2">
              <button onClick={() => scrollProperties('left')} className="w-14 h-14 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-colors">
                <ChevronLeft size={24} />
              </button>
              <button onClick={() => scrollProperties('right')} className="w-14 h-14 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
            <Link to="/properties" className="hidden md:flex justify-center items-center gap-4 text-xs uppercase tracking-[0.2em] font-bold text-white hover:text-primary transition-colors group border border-white/20 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md h-14">
              View Collection
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
        
        {/* Horizontal Scroll Area */}
        <div className="w-full overflow-hidden pb-12">
          <div ref={scrollContainerRef} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-6 md:px-12 gap-8 md:gap-16 pb-10">
            {featuredProperties.map((prop, idx) => (
              <motion.div 
                key={prop.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                viewport={{ once: true, margin: "-50px" }}
                className="snap-center shrink-0 w-[85vw] md:w-[50vw] lg:w-[25vw] group cursor-pointer relative"
              >
                <Link to={`/properties/${prop.id}`} className="block">
                  <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-white"></div>
                  <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-white"></div>
                  
                  <div className="relative aspect-square overflow-hidden mb-6 border-stitch-dark p-2 bg-white/5 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-navy/40 z-10 group-hover:bg-transparent transition-colors duration-700" />
                    <img 
                      src={prop.image} 
                      alt={prop.name} 
                      className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                       <span className="bg-primary text-navy px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-md">
                        {prop.type}
                      </span>
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                         {prop.rent}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-display font-medium mb-3 text-white group-hover:text-primary transition-colors">{prop.name}</h3>
                      <p className="text-white/50 flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                        <MapPin size={14} /> {prop.location}
                      </p>
                      {prop.amenities && prop.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {prop.amenities.slice(0, 3).map((amenity: string, i: number) => (
                            <span key={i} className="text-[9px] uppercase tracking-widest border border-white/20 text-white/70 px-2 py-1 bg-white/5">
                              {amenity}
                            </span>
                          ))}
                          {prop.amenities.length > 3 && (
                            <span className="text-[9px] uppercase tracking-widest text-white/50 py-1">
                              +{prop.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Ethos (LIGHT) */}
      <section className="py-32 bg-light-alt relative overflow-hidden stitch-grid">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
             <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative aspect-square w-full bg-white border-stitch p-6 shadow-xl"
            >
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80" 
                alt="Modern Architecture" 
                className="w-full h-full object-cover grayscale-[20%]"
              />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary flex items-center justify-center p-8 z-20 shadow-2xl">
                 <p className="font-display text-4xl leading-tight font-medium text-navy text-center">
                   Top 1%<br/><span className="text-xl font-sans tracking-widest uppercase">Of Homes</span>
                 </p>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="lg:pl-16 relative"
            >
              <motion.div variants={fadeUp} className="mb-8 inline-flex items-center gap-4">
                <span className="text-navy text-xs uppercase tracking-[0.3em] font-bold border-stitch-b pb-2 pr-8">Our Ethos</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-5xl md:text-[72px] leading-[0.95] font-display font-bold mb-10 text-navy uppercase tracking-tighter">
                Building Spaces.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-navy/50 to-navy font-medium italic">Enriching Lives.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-navy/70 mb-10 leading-relaxed font-sans border-l border-navy/20 pl-6">
                We believe finding a home shouldn't be a transaction; it should be a cinematic, seamless experience. Quest Housing brings the finest, vetted properties across Bangalore directly to you. No noise, no clutter, just premium spaces.
              </motion.p>
              
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-12 mb-12 border-stitch-b pb-12">
                <div>
                  <h4 className="text-6xl font-display text-navy mb-2 tracking-tighter">500<span className="text-primary">+</span></h4>
                  <p className="text-[10px] uppercase tracking-widest text-navy/60 font-bold">Verified Properties</p>
                </div>
                <div>
                  <h4 className="text-6xl font-display text-navy mb-2 tracking-tighter">10<span className="text-primary">k</span></h4>
                  <p className="text-[10px] uppercase tracking-widest text-navy/60 font-bold">Happy Tenants</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link to="/about" className="inline-flex items-center gap-4 text-navy uppercase text-xs tracking-[0.2em] font-bold hover:text-primary transition-colors group">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border border-navy/10 shadow-sm group-hover:border-primary transition-colors">
                    <Plus size={16} />
                  </div>
                  Read Our Story
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-32 bg-white relative overflow-hidden stitch-grid">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-24 max-w-4xl mx-auto"
          >
            <span className="inline-block text-navy/50 text-xs uppercase tracking-[0.3em] font-bold mb-6 border-b border-navy/20 pb-2">Our Solutions</span>
            <h2 className="text-5xl md:text-[80px] font-display font-medium mb-8 leading-[0.9] tracking-tighter uppercase text-navy">Real Estate Services</h2>
            <p className="text-navy/60 text-lg font-sans mx-auto max-w-2xl leading-relaxed">At Quest Housing, we simplify property discovery, owner listings, and tenant management with premium real estate solutions built for Bangalore.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.0 }}
              viewport={{ once: true }}
              className="bg-navy p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-navy group-hover:border-primary transition-all duration-500">
                <HomeIcon size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-white tracking-tight leading-tight">Free Property Listings for Owners</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                List your property at no cost and reach verified buyers or tenants effortlessly. Showcase your flats, villas, PGs, or commercial spaces to thousands of potential seekers.
              </p>
            </motion.div>

            {/* Service 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-light-alt border border-navy/10 p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy mb-8 border border-navy/10 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
                <Headset size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-navy tracking-tight leading-tight">Personal Assistance</h3>
              <p className="text-navy/60 font-sans text-sm leading-relaxed">
                Efficiently handle maintenance requests and work orders through our app.
              </p>
            </motion.div>

            {/* Service 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-navy p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-navy group-hover:border-primary transition-all duration-500">
                <Search size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-white tracking-tight leading-tight">Find Properties</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Discover a wide range of verified flats, villas, PGs, and rental homes tailored to your budget and location preferences—all in one place.
              </p>
            </motion.div>

            {/* Service 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-light-alt border border-navy/10 p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy mb-8 border border-navy/10 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
                <ClipboardList size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-navy tracking-tight leading-tight">Tenant Management</h3>
              <p className="text-navy/60 font-sans text-sm leading-relaxed">
                Keep track of tenant information and lease agreements without hassle. Our app allows you to store and manage all necessary details.
              </p>
            </motion.div>

            {/* Service 5 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-navy p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-navy group-hover:border-primary transition-all duration-500">
                <Sparkles size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-white tracking-tight leading-tight">Available Properties Tailored</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                At Quest Housing, we make property discovery simple, transparent, and reliable. Whether you’re searching for your dream home, an investment plot, or a commercial space, our dedicated services are built to help you find the right fit — quickly and confidently.
              </p>
            </motion.div>

            {/* Service 6 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-light-alt border border-navy/10 p-10 rounded-[2rem] flex flex-col justify-start relative group shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-primary transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-navy/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500" />
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-navy mb-8 border border-navy/10 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-3xl font-display font-medium mb-4 uppercase text-navy tracking-tight leading-tight">Get Verified Owners</h3>
              <p className="text-navy/60 font-sans text-sm leading-relaxed">
                Keep track of tenant information and lease agreements without hassle. Our app allows you to store and manage all necessary details.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us - Bento Grid (LIGHT) */}
      <section className="py-32 bg-light relative overflow-hidden stitch-grid">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-24 max-w-4xl mx-auto"
          >
            <span className="inline-block text-navy/50 text-xs uppercase tracking-[0.3em] font-bold mb-6 border-b border-navy/20 pb-2">The Difference</span>
            <h2 className="text-5xl md:text-[80px] font-display font-medium mb-8 leading-[0.9] tracking-tighter uppercase text-navy">Why Quest Housing</h2>
            <p className="text-navy/60 text-lg font-sans mx-auto max-w-lg">Elevating the standard of rental discovery with cinematic presentation and rigorous vetting.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[350px]">
             {/* Bento Item 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="md:col-span-8 bg-white border border-navy/10 p-12 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 bg-navy text-white flex items-center justify-center">
                  <Shield size={28} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">01 / Assurance</span>
              </div>
              <div>
                <h3 className="text-5xl font-display font-medium mb-4 uppercase text-navy tracking-tighter">100% Verified</h3>
                <p className="text-navy/60 max-w-md text-lg font-sans">Every listing undergoes rigorous physical inspection, preserving the integrity of our portfolio and avoiding scams.</p>
              </div>
            </motion.div>
            
             {/* Bento Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
               className="md:col-span-4 bg-navy text-white p-12 flex flex-col justify-between relative group hover:bg-navy-dark transition-colors shadow-sm"
            >
              <div className="cross-mark top-0 right-0 translate-x-1/2 -translate-y-1/2 text-primary"></div>
              <div className="w-16 h-16 border border-white/20 flex items-center justify-center text-primary">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-4xl font-display font-medium mb-4 uppercase text-white tracking-tighter">Premium<br/>Network</h3>
                <p className="text-white/60 font-sans">Matching exclusive owners with highly qualified professionals.</p>
              </div>
            </motion.div>
            
            {/* Bento Item 3 (Image) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:col-span-8 relative overflow-hidden group border border-navy/10"
            >
              <img 
                src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop&q=80" 
                alt="Interior Design" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent p-12 flex flex-col justify-end">
                <div className="bg-white p-6 inline-block max-w-[80%] md:max-w-md shadow-2xl relative">
                  <h3 className="text-4xl font-display font-medium mb-3 uppercase text-navy tracking-tighter">Dedicated Support</h3>
                  <p className="text-navy/70 text-sm font-sans">Our concierge team provides personalized, end-to-end assistance from initial discovery to final agreement signing.</p>
                  <div className="absolute top-0 right-0 w-8 h-8 bg-primary -translate-y-1/2 translate-x-1/2 rotate-12 group-hover:rotate-45 transition-transform" />
                </div>
              </div>
            </motion.div>

            {/* Bento Item 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="md:col-span-4 bg-white border border-navy/10 p-12 flex flex-col justify-between relative group hover:border-primary transition-colors shadow-sm"
            >
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary">
                <Star size={28} />
              </div>
              <div>
                <h3 className="text-4xl font-display font-medium mb-4 uppercase text-navy tracking-tighter">Cinematic Detail</h3>
                <p className="text-navy/60 font-sans">Immersive, high-fidelity visual tours for every property showcased.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials (DARK) */}
      <section className="py-32 bg-navy-dark relative overflow-hidden stitch-grid-dark text-white">
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="inline-block text-white/40 text-xs uppercase tracking-[0.3em] font-bold mb-6 border-stitch-b-dark pb-2 pr-8">Client Stories</span>
              <h2 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter text-white">Voices Of Trust</h2>
            </div>
            <div className="flex gap-4">
              <button onClick={prevTestimonial} className="w-14 h-14 border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-navy transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextTestimonial} className="w-14 h-14 bg-white flex items-center justify-center text-navy hover:bg-primary transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-white/10 pt-16">
             <div className="md:col-span-4 flex flex-col items-start gap-6">
                <div className="w-32 h-32 overflow-hidden border border-white/20 bg-white/5 p-2 grayscale hover:grayscale-0 transition-all duration-500">
                  <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-3xl font-display font-medium tracking-tight mb-2 uppercase text-white">{testimonials[activeTestimonial].name}</h4>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold border border-primary/30 px-3 py-1 inline-block">{testimonials[activeTestimonial].type}</span>
                </div>
             </div>
             <div className="md:col-span-8 flex flex-col justify-center">
                  <div className="flex gap-2 mb-8 text-primary">
                    <Star size={20} className="fill-primary" />
                    <Star size={20} className="fill-primary" />
                    <Star size={20} className="fill-primary" />
                    <Star size={20} className="fill-primary" />
                    <Star size={20} className="fill-primary" />
                  </div>
                  <p className="text-3xl md:text-5xl text-white leading-tight font-display font-medium uppercase tracking-tighter">
                    "{testimonials[activeTestimonial].review}"
                  </p>
             </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section (LIGHT LUXURY) */}
      <section className="py-40 relative flex items-center justify-center overflow-hidden bg-light border-y border-navy/10 stitch-grid">
        <div className="container mx-auto px-6 md:px-12 relative z-20 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 mx-auto border border-navy flex items-center justify-center mb-12">
               <span className="text-4xl font-display font-black text-navy uppercase">Q</span>
            </div>
            <h2 className="text-6xl md:text-[90px] font-display mb-12 text-navy font-black tracking-tighter uppercase leading-[0.9]">
              Step Into Your<br/><span className="text-primary italic font-medium">New Reality.</span>
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
              <Link to="/register" className="px-12 py-5 bg-navy text-white font-bold text-xs uppercase tracking-[0.2em] text-center hover:bg-navy-dark transition-all shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)]">
                Register Your Interest
              </Link>
              <a href="https://wa.me/918886131316" target="_blank" rel="noreferrer" className="flex items-center gap-4 px-12 py-5 bg-transparent text-navy font-bold text-xs uppercase tracking-[0.2em] text-center border-2 border-navy hover:bg-navy/5 transition-all">
                <div className="w-2 h-2 rounded-full bg-navy animate-pulse"></div>
                Chat With Concierge
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

