import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadFormStore } from '../../../store/useLeadFormStore';

const BUDGET_OPTIONS = [
  { label: 'Under ₹15k', type: 'under_15k', min: 0, max: 15000 },
  { label: '₹15k–₹25k', type: '15k_25k', min: 15000, max: 25000 },
  { label: '₹25k–₹40k', type: '25k_40k', min: 25000, max: 40000 },
  { label: '₹40k–₹60k', type: '40k_60k', min: 40000, max: 60000 },
  { label: '₹60k+', type: '60k_plus', min: 60000, max: 200000 },
  { label: 'Other', type: 'other', min: 0, max: 0 },
];

export default function StepBudget() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();
  const [showCustom, setShowCustom] = useState(formData.budgetType === 'other');

  const selectBudget = (opt: (typeof BUDGET_OPTIONS)[number]) => {
    if (opt.type === 'other') {
      setShowCustom(true);
      updateData({ budgetType: 'other' });
    } else {
      setShowCustom(false);
      updateData({ budgetType: opt.type, budgetMin: opt.min, budgetMax: opt.max });
    }
  };

  const canContinue = formData.budgetType && (formData.budgetType !== 'other' || (formData.budgetMin > 0 && formData.budgetMax > formData.budgetMin));

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">BUDGET</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy">
          What's your monthly budget?
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        {BUDGET_OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => selectBudget(opt)}
            className={`border px-6 py-4 cursor-pointer transition-all shadow-sm ${
              formData.budgetType === opt.type
                ? 'border-primary bg-primary/10 text-navy font-medium'
                : 'border-navy/15 bg-white hover:bg-navy/5 text-navy'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showCustom && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-4 w-full overflow-hidden"
          >
            <input
              type="number"
              placeholder="Min ₹"
              value={formData.budgetMin || ''}
              onChange={(e) => updateData({ budgetMin: Number(e.target.value) })}
              className="flex-1 bg-white border border-navy/20 text-navy text-lg p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-navy/30 shadow-sm"
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={formData.budgetMax || ''}
              onChange={(e) => updateData({ budgetMax: Number(e.target.value) })}
              className="flex-1 bg-white border border-navy/20 text-navy text-lg p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-navy/30 shadow-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6">
        <button onClick={prevStep} className="text-navy/50 hover:text-navy text-xs uppercase tracking-widest cursor-pointer transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
