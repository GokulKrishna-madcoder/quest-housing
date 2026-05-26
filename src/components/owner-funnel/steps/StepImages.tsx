import { useState } from 'react';
import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { UploadCloud, X } from 'lucide-react';

export default function StepImages() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formData.images.length + newFiles.length > 6) {
        toast.error('You can only upload up to 6 images.');
        return;
      }
      
      const oversizedFiles = newFiles.filter(f => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('Each image must be less than 5MB.');
        return;
      }

      updateData({ images: [...formData.images, ...newFiles] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateData({ images: newImages });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      
      // Upload images
      for (const file of formData.images) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.fullName.replace(/[^a-zA-Z]/g, '').substring(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('owner-property-images')
          .upload(fileName, file);
          
        if (uploadError) throw new Error('Failed to upload image: ' + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage
          .from('owner-property-images')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      // Insert to owner_leads
      const { error: dbError } = await supabase
        .from('owner_leads')
        .insert([{
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp || null,
          property_type: formData.propertyType,
          location: formData.location,
          description: formData.description || null,
          image_urls: uploadedUrls,
          utm_source: formData.utmSource || '',
          utm_medium: formData.utmMedium || '',
          utm_campaign: formData.utmCampaign || '',
        }]);

      if (dbError) throw new Error(dbError.message);

      nextStep();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit property');
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
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-6 tracking-tighter">
        Showcase your property.
      </h2>
      <p className="text-white/50 mb-10">Upload up to 6 high-quality images of your space.</p>
      
      <div className="max-w-xl mx-auto mb-8">
        <label className="border-2 border-dashed border-white/20 hover:border-primary bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center p-12 cursor-pointer group rounded-xl">
          <UploadCloud size={48} className="text-white/30 group-hover:text-primary mb-4 transition-colors" />
          <span className="text-white text-lg font-medium mb-1">Click to upload images</span>
          <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Max 5MB each (JPG, PNG)</span>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
      </div>

      {formData.images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-xl mx-auto mb-12">
          {formData.images.map((file, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button 
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-6">
        <button 
          onClick={prevStep}
          disabled={isSubmitting}
          className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors disabled:opacity-30"
        >
          Back
        </button>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-navy border-t-transparent animate-spin" /> 
              Uploading...
            </>
          ) : (
            'Submit Property'
          )}
        </button>
      </div>
    </motion.div>
  );
}
