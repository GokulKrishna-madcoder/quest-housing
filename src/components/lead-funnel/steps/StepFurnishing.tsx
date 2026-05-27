import { useLeadFormStore } from '../../../store/useLeadFormStore';

const FURNISHING_OPTIONS = ['Fully Furnished', 'Semi Furnished', 'Unfurnished', 'Any'];

export default function StepFurnishing() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();

  const toggle = (type: string) => {
    const current = formData.furnishingType;
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    updateData({ furnishingType: next });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">FURNISHING</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy">
          Furnishing preference?
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {FURNISHING_OPTIONS.map((type) => {
          const selected = formData.furnishingType.includes(type);
          return (
            <button
              key={type}
              onClick={() => toggle(type)}
              className={`border px-6 py-4 cursor-pointer transition-all text-center shadow-sm ${
                selected
                  ? 'border-primary bg-primary/10 text-navy font-medium'
                  : 'border-navy/15 bg-white hover:bg-navy/5 text-navy'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-6">
        <button onClick={prevStep} className="text-navy/50 hover:text-navy text-xs uppercase tracking-widest cursor-pointer transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={formData.furnishingType.length === 0}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
