import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

export default function StepSuccess({ onClose, key }: { onClose: () => void; key?: string }) {
  const { formData, reset } = useOwnerFormStore();

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl text-center"
    >
      <div className="w-24 h-24 bg-primary flex items-center justify-center mx-auto mb-8 text-navy rounded-2xl">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-6 uppercase tracking-tighter">
        Concierge Notified
      </h2>
      <p className="text-white/70 mb-10 leading-relaxed font-sans text-lg max-w-md mx-auto">
        Thank you, {formData.fullName}. Our curation team is reviewing your property and will contact you via WhatsApp shortly to begin your onboarding.
      </p>
      <button 
        onClick={handleClose}
        className="bg-white text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary transition-all shadow-[8px_8px_0px_rgba(247,209,18,0.5)] hover:shadow-[4px_4px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1"
      >
        Return to Website
      </button>
    </motion.div>
  );
}
