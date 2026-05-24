import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useLeadFormStore } from '../../../store/useLeadFormStore';

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function StepContact() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();
  const [submitting, setSubmitting] = useState(false);

  const valid = PHONE_REGEX.test(formData.whatsappNumber);

  const handleSubmit = async () => {
    if (!valid) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from('instagram_leads').insert({
        full_name: formData.fullName,
        whatsapp_number: formData.whatsappNumber,
        budget_type: formData.budgetType,
        budget_min: formData.budgetMin,
        budget_max: formData.budgetMax,
        preferred_location: formData.preferredLocation,
        preferred_pincode: formData.preferredPincode,
        move_in_type: formData.moveInType,
        move_in_date: formData.moveInDate || null,
        property_type: formData.propertyType,
        furnishing_type: formData.furnishingType,
      });
      if (error) throw error;
      nextStep();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold mb-4">CONTACT</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-white">
          Almost done! Your WhatsApp number?
        </h1>
      </div>

      <div className="flex items-stretch w-full">
        <span className="bg-white/5 border border-r-0 border-white/20 text-white/60 text-lg px-4 flex items-center font-mono">
          +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={formData.whatsappNumber}
          onChange={(e) => updateData({ whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          placeholder="9876543210"
          className="flex-1 bg-white/10 border border-white/20 text-white text-lg p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-white/30"
        />
      </div>

      <div className="flex items-center gap-6">
        <button onClick={prevStep} className="text-white/50 hover:text-white text-xs uppercase tracking-widest cursor-pointer transition-colors">
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
