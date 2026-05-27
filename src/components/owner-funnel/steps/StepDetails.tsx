import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

export default function StepDetails() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();

  const handleNext = () => {
    nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl text-center"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        Tell us a bit about it.
      </h2>
      <div className="space-y-4 max-w-lg mx-auto">
        <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block text-left ml-4">Brief Description (Optional)</label>
        <textarea 
          autoFocus
          rows={4}
          value={formData.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Premium features, amenities, recently renovated..." 
          className="w-full bg-white/10 border border-white/20 text-white text-lg p-6 focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-white/20"
        />
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
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
