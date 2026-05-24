import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Shield, Star, Key, Building2 } from 'lucide-react';
import { Toaster } from 'sonner';
import OwnerFunnelLayout from '../components/owner-funnel/OwnerFunnelLayout';
import { useOwnerFormStore } from '../store/useOwnerFormStore';

export default function Registration() {
  const [showFunnel, setShowFunnel] = useState(false);
  const resetStore = useOwnerFormStore(state => state.reset);

  useEffect(() => {
    if (showFunnel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFunnel]);

  const handleOpenFunnel = () => {
    resetStore();
    setShowFunnel(true);
  };

  const features = [
    {
      icon: <Star className="text-primary mb-4" size={32} />,
      title: "Curated Audience",
      desc: "Get access to a high-net-worth network of verified professionals and expats."
    },
    {
      icon: <Shield className="text-primary mb-4" size={32} />,
      title: "Secure & Private",
      desc: "Your property details remain confidential until we verify the right match."
    },
    {
      icon: <Key className="text-primary mb-4" size={32} />,
      title: "End-to-End Management",
      desc: "From legal paperwork to key handover, our concierge handles it all."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center relative overflow-hidden bg-light text-navy stitch-grid">
      <Toaster position="top-right" richColors />
      
      <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-6xl flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-navy/50 text-xs uppercase tracking-[0.3em] font-bold mb-4 bg-navy/5 px-4 py-1.5 rounded-full">
              For Property Owners
            </span>
            <h1 className="text-5xl md:text-[80px] font-display font-medium mb-6 uppercase tracking-tighter leading-[0.9]">
              Partner with <br /> Quest
            </h1>
            <p className="text-xl text-navy/60 font-sans max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Experience a curated approach to real estate in Bangalore. Secure, private, and exceptionally premium.
            </p>
            
            <button 
              onClick={handleOpenFunnel}
              className="bg-navy text-white font-bold text-sm uppercase tracking-[0.2em] px-12 py-5 shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)] transition-all flex items-center gap-3 mx-auto lg:mx-0 group"
            >
              List Your Property 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Cards */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none">
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-6"
          >
            {features.map((feature, i) => (
              <div key={i} className="bg-white border border-navy/10 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow flex gap-6 items-start group">
                <div className="shrink-0 p-3 bg-navy/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-display font-medium mb-2 uppercase">{feature.title}</h3>
                  <p className="text-navy/60 text-sm font-sans leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>

      <AnimatePresence>
        {showFunnel && (
          <OwnerFunnelLayout onClose={() => setShowFunnel(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
