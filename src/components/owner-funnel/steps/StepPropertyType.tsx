import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

const TYPES = ['Apartment', 'Villa', 'Independent House', 'Studio', 'PG', 'Commercial'];

export default function StepPropertyType() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();

  const handleSelect = (type: string) => {
    updateData({ propertyType: type });
    nextStep();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl text-center"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        What type of property?
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => handleSelect(type)}
            className={`border bg-white/5 hover:bg-white/10 px-6 py-6 cursor-pointer transition-all ${
              formData.propertyType === type 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-white/20 text-white'
            }`}
          >
            <span className="font-display text-xl">{type}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={prevStep}
          className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          Back
        </button>
        <button 
          onClick={nextStep}
          disabled={!formData.propertyType}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
