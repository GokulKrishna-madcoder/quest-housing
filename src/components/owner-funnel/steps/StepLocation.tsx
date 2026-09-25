import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

export default function StepLocation() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!formData.location.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (formData.leadId) {
        // Just update existing partial lead
        await supabase.from('owner_leads').update({
          location: formData.location
        }).eq('id', formData.leadId);
        nextStep();
      } else {
        // Create new partial lead
        const { data, error } = await supabase.from('owner_leads').insert([{
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          location: formData.location,
          status: 'Partial',
          utm_source: formData.utmSource || '',
          utm_medium: formData.utmMedium || '',
          utm_campaign: formData.utmCampaign || '',
        }]).select('id').single();

        if (error) throw error;
        
        if (data && data.id) {
          updateData({ leadId: data.id });
        }
        nextStep();
      }
    } catch (err: any) {
      console.error('Error saving partial lead:', err);
      // We shouldn't block the user if the partial lead fails to save
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl text-center"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        Where is it located?
      </h2>
      <input 
        type="text" 
        autoFocus
        value={formData.location}
        onChange={(e) => updateData({ location: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        placeholder="e.g. Indiranagar, Bangalore" 
        className="w-full bg-transparent border-b-2 border-white/20 text-white text-3xl md:text-4xl text-center pb-4 focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
      />
      <div className="mt-16 flex items-center justify-center gap-6">
        <button 
          onClick={prevStep}
          className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          Back
        </button>
        <button 
          onClick={handleNext}
          disabled={!formData.location.trim() || isSubmitting}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-navy border-t-transparent animate-spin" />
              Saving...
            </>
          ) : 'Continue'}
        </button>
      </div>
    </motion.div>
  );
}
