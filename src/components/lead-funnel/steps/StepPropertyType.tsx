import { useLeadFormStore } from '../../../store/useLeadFormStore';

const PROPERTY_TYPES = ['1 BHK', '2 BHK', '3 BHK', 'Villa', 'PG / Hostel', 'Studio'];

export default function StepPropertyType() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();

  const toggle = (type: string) => {
    const current = formData.propertyType;
    const next = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    updateData({ propertyType: next });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">PROPERTY</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy">
          What type of property?
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
        {PROPERTY_TYPES.map((type) => {
          const selected = formData.propertyType.includes(type);
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
          disabled={formData.propertyType.length === 0}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
