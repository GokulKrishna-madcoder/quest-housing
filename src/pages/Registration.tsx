import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, Shield, UploadCloud } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { supabase } from '../lib/supabase';
type FormType = 'owner' | 'tenant';

export default function Registration() {
  const [formType, setFormType] = useState<FormType>('owner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validations
    const emailStr = data.email as string;
    const phoneStr = data.phone as string;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phoneStr)) {
      toast.error('Please enter a valid phone number (min 10 digits)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      data.formType = formType;

      let base64Files: any[] = [];
      if (formType === 'owner') {
        const files = formData.getAll('propertyImages') as File[];
        const validFiles = files.filter(f => f.size > 0 && f.name !== '');
        
        if (validFiles.length > 6) {
          toast.error('You can only upload up to 6 images.');
          setIsSubmitting(false);
          return;
        }

        const oversizedFiles = validFiles.filter(f => f.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          toast.error('Each image must be less than 5MB.');
          setIsSubmitting(false);
          return;
        }

        const uploadedUrls: string[] = [];
        
        // Upload each valid file to Supabase Storage
        for (const file of validFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${data.fullName.toString().replace(/[^a-zA-Z]/g, '').substring(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('owner-property-images')
            .upload(filePath, file);
            
          if (uploadError) {
             console.error('Upload error:', uploadError);
             throw new Error('Failed to upload image: ' + uploadError.message);
          }
          
          const { data: publicUrlData } = supabase.storage
            .from('owner-property-images')
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrlData.publicUrl);
        }

        // Insert into owner_leads
        const { error: dbError } = await supabase
          .from('owner_leads')
          .insert([
            {
              full_name: data.fullName,
              email: data.email,
              phone: data.phone,
              whatsapp: data.whatsapp || null,
              property_type: data.propertyType,
              location: data.location,
              description: data.description || null,
              image_urls: uploadedUrls,
            }
          ]);
          
        if (dbError) throw new Error(dbError.message);

      } else {
        // Insert into tenant_leads
        const { error: dbError } = await supabase
          .from('tenant_leads')
          .insert([
            {
              full_name: data.fullName,
              email: data.email,
              phone: data.phone,
              whatsapp: data.whatsapp || null,
              looking_for: data.intent,
              preferred_location: data.preferredLocation,
              preferences: data.preferences || null,
            }
          ]);
          
        if (dbError) throw new Error(dbError.message);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Your application was submitted successfully.');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      toast.error('Failed to submit application: ' + err.message);
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center relative overflow-hidden bg-light text-navy stitch-grid">
      <Toaster position="top-right" richColors />
      <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-navy/50 text-xs uppercase tracking-[0.3em] font-bold mb-4">Join The Network</span>
          <h1 className="text-5xl md:text-[80px] font-display font-medium mb-4 uppercase tracking-tighter">Partner with Quest</h1>
          <p className="text-xl text-navy/60 font-sans max-w-2xl mx-auto">Experience a curated approach to real estate in Bangalore. Secure, private, and exceptionally premium.</p>
        </motion.div>

        {isSuccess ? (
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-2xl mx-auto bg-white border-stitch p-16 text-center shadow-xl relative"
          >
            <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
            <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
            <div className="w-24 h-24 bg-primary flex items-center justify-center mx-auto mb-8 text-navy">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-4xl font-display font-medium mb-6 uppercase tracking-tighter">Concierge Notified</h2>
            <p className="text-navy/70 mb-10 leading-relaxed font-sans text-lg">
              Thank you for trusting Quest Housing. Our curation team is reviewing your profile and will contact you via WhatsApp shortly to begin your onboarding.
            </p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="px-10 py-5 bg-navy text-white font-bold uppercase text-xs tracking-widest hover:bg-navy-dark border border-navy transition-colors"
            >
              Submit Another Request
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white border-stitch flex flex-col md:flex-row relative shadow-sm"
          >
             <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
             <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>
             <div className="absolute top-0 left-0 w-full h-[2px] bg-navy" />
            
            {/* Sidebar */}
            <div className="md:w-1/3 p-10 md:p-14 flex flex-col justify-between border-stitch-b md:border-stitch-b-0 md:border-r border-navy/20 relative bg-light/50">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-navy/50 mb-10 border-stitch-b pb-4">Select Profile</h3>
                <div className="flex flex-col gap-5">
                  <button
                    type="button"
                    onClick={() => setFormType('owner')}
                    className={`text-left p-8 transition-all duration-300 relative overflow-hidden group border ${
                      formType === 'owner' 
                        ? 'border-navy bg-navy text-white shadow-xl translate-x-2' 
                        : 'border-transparent hover:border-navy/20 text-navy/50'
                    }`}
                  >
                     {formType === 'owner' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />}
                    <h4 className={`text-2xl font-display mb-2 transition-colors uppercase ${formType === 'owner' ? 'text-primary' : 'group-hover:text-navy'}`}>Property Owner</h4>
                    <p className="text-sm font-sans opacity-80">List your premium property in our curated portfolio.</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormType('tenant')}
                    className={`text-left p-8 transition-all duration-300 relative overflow-hidden group border ${
                      formType === 'tenant' 
                        ? 'border-navy bg-navy text-white shadow-xl translate-x-2' 
                        : 'border-transparent hover:border-navy/20 text-navy/50'
                    }`}
                  >
                     {formType === 'tenant' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />}
                    <h4 className={`text-2xl font-display mb-2 transition-colors uppercase ${formType === 'tenant' ? 'text-primary' : 'group-hover:text-navy'}`}>Tenant</h4>
                    <p className="text-sm font-sans opacity-80">Apply to access exclusive, verified luxury rentals.</p>
                  </button>
                </div>
              </div>
              <div className="mt-16 hidden md:flex items-center gap-3 opacity-40">
                <Shield size={16} />
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Encrypted & Secure</p>
              </div>
            </div>

            {/* Form Area */}
            <div className="md:w-2/3 p-10 md:p-16 xl:p-20 relative">
              <AnimatePresence mode="wait">
                <motion.form 
                  key={formType}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-10 h-full max-w-2xl mx-auto"
                >
                  <div>
                    <h3 className="text-4xl font-display font-medium mb-3 tracking-tighter uppercase">
                      {formType === 'owner' ? 'Owner Details' : 'Customer Profile'}
                    </h3>
                    <p className="text-navy/50 font-sans text-sm">Please provide accurate information for verification.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Full Name *</label>
                      <input name="fullName" required type="text" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="John Doe" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Phone Number *</label>
                      <input name="phone" required type="tel" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="+91" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Email Address *</label>
                      <input name="email" required type="email" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">WhatsApp Number</label>
                      <input name="whatsapp" type="tel" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="Same as phone" />
                    </div>
                  </div>

                  {formType === 'owner' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Property Type *</label>
                          <div className="relative">
                            <select name="propertyType" required defaultValue="" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy appearance-none cursor-pointer font-sans">
                              <option value="" disabled hidden>Select Type</option>
                              <option value="Apartment">Apartment</option>
                              <option value="Villa">Villa</option>
                              <option value="Independent House">Independent House</option>
                              <option value="Studio">Studio</option>
                              <option value="PG">PG</option>
                              <option value="Commercial">Commercial</option>
                            </select>
                             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Location (Bangalore) *</label>
                          <input name="location" required type="text" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="e.g. Indiranagar" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Brief Description</label>
                        <textarea name="description" rows={3} className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy resize-none font-sans" placeholder="Tell us about the premium features..."></textarea>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1 flex items-center gap-2"><UploadCloud size={14} /> Property Images (Max 6)</label>
                        <input name="propertyImages" type="file" multiple accept="image/*" className="w-full bg-light border border-navy/10 px-5 py-3 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-navy/20 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.1em] file:bg-navy file:text-primary hover:file:bg-navy-dark cursor-pointer text-sm" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Looking For *</label>
                          <div className="relative">
                            <select name="intent" required defaultValue="" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy appearance-none cursor-pointer font-sans">
                              <option value="" disabled hidden>Select Requirement</option>
                              <option value="Rent">Rent</option>
                              <option value="Lease">Lease</option>
                              <option value="Shared">Shared Accommodation</option>
                            </select>
                             <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Preferred Location *</label>
                          <input name="preferredLocation" required type="text" className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy font-sans" placeholder="e.g. HSR Layout" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-navy/70 ml-1">Additional Preferences</label>
                        <textarea name="preferences" rows={3} className="w-full bg-light border border-navy/10 px-5 py-4 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy resize-none font-sans" placeholder="Budget, move-in date, amenities..."></textarea>
                      </div>
                    </>
                  )}

                  <div className="mt-8 pt-8 border-stitch-b relative">
                    <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-navy text-white font-bold text-xs uppercase tracking-[0.2em] text-center shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : (
                        <>Submit Application <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                </motion.form>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
