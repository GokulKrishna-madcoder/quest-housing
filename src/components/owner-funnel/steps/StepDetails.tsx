import { motion } from 'motion/react';
import { useOwnerFormStore } from '../../../store/useOwnerFormStore';

export default function StepDetails() {
  const { formData, updateData, nextStep, prevStep } = useOwnerFormStore();

  const isBhkApplicable = ['Apartment', 'Villa', 'Independent House'].includes(formData.propertyType);
  const isNotPlot = formData.propertyType !== 'Plots';
  const isRent = formData.propertyIntent === 'rent';

  const handleNext = () => {
    nextStep();
  };

  const isFormValid = () => {
    if (isBhkApplicable && !formData.bhk) return false;
    if (isNotPlot && !formData.area) return false;
    if (isNotPlot && !formData.furnishing) return false;
    if (!formData.parking) return false;
    if (!formData.price) return false;
    if (isRent && !formData.deposit) return false;
    if (isRent && !formData.maintenance) return false;
    return true;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-4xl text-center pb-20"
    >
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium text-white mb-10 tracking-tighter">
        Tell us a bit about it.
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
        
        {isBhkApplicable && (
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">BHK *</label>
            <select 
              value={formData.bhk}
              onChange={(e) => updateData({ bhk: e.target.value })}
              className="w-full bg-white/5 border border-white/20 text-white text-sm p-4 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="" disabled className="bg-navy text-white">Select BHK</option>
              <option value="1 BHK" className="bg-navy text-white">1 BHK</option>
              <option value="2 BHK" className="bg-navy text-white">2 BHK</option>
              <option value="3 BHK" className="bg-navy text-white">3 BHK</option>
              <option value="4 BHK" className="bg-navy text-white">4 BHK</option>
              <option value="4+ BHK" className="bg-navy text-white">4+ BHK</option>
            </select>
          </div>
        )}

        {isNotPlot && (
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Built-up Area (sq. ft) *</label>
            <input 
              type="number"
              value={formData.area}
              onChange={(e) => updateData({ area: e.target.value })}
              placeholder="e.g. 1200"
              className="w-full bg-white/5 border border-white/20 text-white text-sm p-4 rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
            />
          </div>
        )}

        {isNotPlot && (
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Furnishing *</label>
            <select 
              value={formData.furnishing}
              onChange={(e) => updateData({ furnishing: e.target.value })}
              className="w-full bg-white/5 border border-white/20 text-white text-sm p-4 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="" disabled className="bg-navy text-white">Select Furnishing</option>
              <option value="Fully Furnished" className="bg-navy text-white">Fully Furnished</option>
              <option value="Semi Furnished" className="bg-navy text-white">Semi Furnished</option>
              <option value="Unfurnished" className="bg-navy text-white">Unfurnished</option>
            </select>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Parking *</label>
          <div className="flex gap-4">
            <button
              onClick={() => updateData({ parking: 'Yes' })}
              className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                formData.parking === 'Yes'
                  ? 'bg-primary text-navy'
                  : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => updateData({ parking: 'No' })}
              className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                formData.parking === 'No'
                  ? 'bg-primary text-navy'
                  : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">
            {isRent ? 'Expected Rent (₹) *' : 'Expected Sale Price (₹) *'}
          </label>
          <input 
            type="number"
            value={formData.price}
            onChange={(e) => updateData({ price: e.target.value })}
            placeholder={isRent ? "e.g. 25000" : "e.g. 15000000"}
            className="w-full bg-white/5 border border-white/20 text-white text-sm p-4 rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
          />
        </div>

        {isRent && (
          <>
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Deposit (₹) *</label>
              <input 
                type="number"
                value={formData.deposit}
                onChange={(e) => updateData({ deposit: e.target.value })}
                placeholder="e.g. 100000"
                className="w-full bg-white/5 border border-white/20 text-white text-sm p-4 rounded-xl focus:outline-none focus:border-primary transition-colors placeholder:text-white/20"
              />
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Maintenance *</label>
              <div className="flex gap-4">
                <button
                  onClick={() => updateData({ maintenance: 'Owner' })}
                  className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    formData.maintenance === 'Owner'
                      ? 'bg-primary text-navy'
                      : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  By Owner
                </button>
                <button
                  onClick={() => updateData({ maintenance: 'Tenant' })}
                  className={`flex-1 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    formData.maintenance === 'Tenant'
                      ? 'bg-primary text-navy'
                      : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  By Tenant
                </button>
              </div>
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold block mb-3 ml-2">Brief Description (Optional)</label>
          <textarea 
            rows={4}
            value={formData.description}
            onChange={(e) => updateData({ description: e.target.value })}
            placeholder="Premium features, amenities, recently renovated..." 
            className="w-full bg-white/5 border border-white/20 text-white text-sm p-6 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none placeholder:text-white/20"
          />
        </div>
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
          disabled={!isFormValid()}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-white transition-all disabled:opacity-30 disabled:hover:bg-primary rounded-full"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}
