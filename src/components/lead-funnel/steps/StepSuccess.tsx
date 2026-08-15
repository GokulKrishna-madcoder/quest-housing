import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLeadFormStore } from '../../../store/useLeadFormStore';

export default function StepSuccess() {
  const { formData, reset } = useLeadFormStore();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg"
      >
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
          <Check className="w-12 h-12 text-navy" strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy mb-4">
          Thank you, {formData.fullName}!
        </h1>
        <p className="text-navy/50 text-lg">Our team will contact you shortly</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-4"
      >
        <a
          href="https://wa.me/918886131316"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all shadow-sm"
        >
          Chat on WhatsApp
        </a>
        <Link
          to="/properties"
          onClick={reset}
          className="border border-navy/20 text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-navy/5 transition-all shadow-sm"
        >
          Browse Properties
        </Link>
      </motion.div>
    </div>
  );
}
