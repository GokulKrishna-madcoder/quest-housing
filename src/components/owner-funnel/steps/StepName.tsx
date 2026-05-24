import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

export default function StepName() {
  const { formData, updateData, nextStep } = useOwnerFormStore();

  const handleNext = () => {
    if (formData.fullName.trim()) nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl text-center"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        Let's start with your name.
      </h2>
      <input 
        type="text" 
        autoFocus
        value={formData.fullName}
        onChange={(e) => updateData({ fullName: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        placeholder="Enter your full name" 
        className="w-full bg-transparent border-b-2 border-white/20 text-white text-3xl md:text-4xl text-center pb-4 focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
      />
      <button 
        onClick={handleNext}
        disabled={!formData.fullName.trim()}
        className="mt-16 bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary"
      >
        Continue
      </button>
    </motion.div>
  );
}
