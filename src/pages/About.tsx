import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
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

export default function About() {
  return (
    <div className="w-full pt-32 pb-32 bg-light-alt relative overflow-hidden text-navy stitch-grid">
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mb-32 border-stitch-b pb-16"
        >
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-4">
            <span className="text-navy text-xs uppercase tracking-[0.3em] font-bold border-stitch-b pb-2 pr-8">The Origin</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-[90px] font-display font-medium mb-12 uppercase tracking-tighter leading-[0.9] text-navy">
            Redefining<br/>Real Estate in <span className="text-primary italic">Bengaluru.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-navy/70 leading-relaxed font-sans max-w-3xl border-l-[2px] border-navy/20 pl-8">
            Quest Housing was born out of a simple need: to make finding and listing premium rental properties a cinematic, seamless, and deeply trustworthy experience.
          </motion.p>
        </motion.div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-center mb-40">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 bg-white p-6 border-stitch aspect-[4/5] relative shadow-sm group"
          >
            <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
            <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
            <div className="w-full h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-navy/10 z-10 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80" 
                alt="Quest Housing Office Minimalist" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-[1.05] grayscale-[20%]"
              />
            </div>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="lg:col-span-5 relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-navy opacity-10" />
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-display font-medium mb-8 text-navy uppercase tracking-tighter">The Vision</motion.h2>
            <motion.div variants={fadeUp} className="space-y-6 text-lg text-navy/70 font-sans leading-relaxed mb-12">
              <p>
                We aim to bridge the gap between discerning property owners and high-quality tenants. The Bangalore rental market is saturated with noise, fake listings, and poor communication. 
              </p>
              <p className="pl-6 border-l border-navy/20">
                Quest Housing cuts through the clutter, offering only verified properties presented in a cinematic portfolio style that highlights the true architectural and lifestyle value of the space.
              </p>
            </motion.div>
            
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-10 pt-10 border-stitch-b pb-12">
              <div>
                <h4 className="text-5xl font-display text-navy mb-2 tracking-tighter">2021</h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-bold">Founded</p>
              </div>
              <div>
                <h4 className="text-5xl font-display text-navy mb-2 tracking-tighter">100<span className="text-primary">%</span></h4>
                <p className="text-[10px] uppercase tracking-[0.2em] text-navy/50 font-bold">Satisfaction</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to Action Minimal */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-white border-stitch p-16 md:p-24 text-center relative shadow-sm"
        >
          <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
          <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
          <h2 className="text-5xl md:text-6xl font-display font-medium mb-8 uppercase tracking-tighter text-navy relative z-10">Join The Exclusive<br />Network</h2>
          <p className="text-lg text-navy/60 max-w-2xl mx-auto mb-12 font-sans relative z-10">
            Whether you own a premium property in Koramangala or are seeking a quiet villa in Whitefield, our concierge handles the heavy lifting.
          </p>
          <Link to="/register" className="inline-flex items-center justify-center gap-4 px-12 py-5 bg-navy text-white font-bold uppercase tracking-[0.2em] text-xs shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)] transition-all z-10 mx-auto">
            Partner With Us <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
