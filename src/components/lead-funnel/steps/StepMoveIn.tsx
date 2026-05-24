import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeadFormStore } from '../../../store/useLeadFormStore';

const MOVE_OPTIONS = ['Immediately', 'Within 15 Days', 'Within 1 Month', 'Flexible', 'Other Date'];

export default function StepMoveIn() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();
  const [showDate, setShowDate] = useState(formData.moveInType === 'Other Date');

  const selectOption = (opt: string) => {
    updateData({ moveInType: opt, moveInDate: opt === 'Other Date' ? formData.moveInDate : '' });
    setShowDate(opt === 'Other Date');
  };

  const canContinue = formData.moveInType && (formData.moveInType !== 'Other Date' || formData.moveInDate);

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-4">TIMELINE</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-white">
          When do you plan to move in?
        </h1>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        {MOVE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => selectOption(opt)}
            className={`border px-6 py-4 cursor-pointer transition-all ${
              formData.moveInType === opt
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-white/20 bg-white/5 hover:bg-white/10 text-white'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {showDate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
          >
            <input
              type="date"
              value={formData.moveInDate}
              onChange={(e) => updateData({ moveInDate: e.target.value })}
              className="w-full bg-white/10 border border-white/20 text-white text-lg p-4 focus:border-primary focus:outline-none transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6">
        <button onClick={prevStep} className="text-white/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
