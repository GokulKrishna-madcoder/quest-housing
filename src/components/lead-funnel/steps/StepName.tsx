import { useLeadFormStore } from '../../../store/useLeadFormStore';

export default function StepName() {
  const { formData, updateData, nextStep } = useLeadFormStore();

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">LET'S GET STARTED</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy">
          What's your name?
        </h1>
      </div>

      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => updateData({ fullName: e.target.value })}
        placeholder="Enter your full name"
        autoFocus
        className="w-full bg-white border border-navy/20 text-navy text-lg p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-navy/30 shadow-sm"
      />

      <button
        onClick={nextStep}
        disabled={!formData.fullName.trim()}
        className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
      >
        Continue
      </button>
    </div>
  );
}
