import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

export default function StepContact() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();

  const handleNext = () => {
    if (formData.phone.trim() && formData.email.trim()) nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl text-center"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        How can we reach you?
      </h2>
      <div className="space-y-6 max-w-md mx-auto text-left">
        <div className="space-y-2">
           <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-4">Phone Number *</label>
           <input 
             type="tel" 
             autoFocus
             value={formData.phone}
             onChange={(e) => updateData({ phone: e.target.value })}
             placeholder="+91" 
             className="w-full bg-white/10 border border-white/20 text-white text-lg p-4 focus:border-primary focus:outline-none transition-colors"
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-4">Email Address *</label>
           <input 
             type="email" 
             value={formData.email}
             onChange={(e) => updateData({ email: e.target.value })}
             placeholder="john@example.com" 
             className="w-full bg-white/10 border border-white/20 text-white text-lg p-4 focus:border-primary focus:outline-none transition-colors"
           />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold ml-4">WhatsApp (Optional)</label>
           <input 
             type="tel" 
             value={formData.whatsapp}
             onChange={(e) => updateData({ whatsapp: e.target.value })}
             onKeyDown={(e) => e.key === 'Enter' && handleNext()}
             placeholder="Same as phone" 
             className="w-full bg-white/10 border border-white/20 text-white text-lg p-4 focus:border-primary focus:outline-none transition-colors"
           />
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-6">
        <button 
          onClick={prevStep}
          className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handleNext}
          disabled={!formData.phone.trim() || !formData.email.trim()}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
