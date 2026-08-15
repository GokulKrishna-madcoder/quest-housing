import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLeadFormStore } from '../../../store/useLeadFormStore';

interface LocationResult {
  name: string;
  pincode: string;
}

export default function StepLocation() {
  const { formData, updateData, nextStep, prevStep } = useLeadFormStore();
  const [query, setQuery] = useState(formData.preferredLocation);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('bangalore_locations')
        .select('name, pincode')
        .or(`name.ilike.%${query}%,pincode.ilike.%${query}%`)
        .limit(10);
      if (data) {
        setResults(data);
        setOpen(true);
      }
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const selectLocation = (loc: LocationResult) => {
    updateData({ preferredLocation: loc.name, preferredPincode: loc.pincode });
    setQuery(loc.name);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-6 gap-10">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold mb-4">LOCATION</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter text-navy">
          Where do you want to live?
        </h1>
      </div>

      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            updateData({ preferredLocation: e.target.value, preferredPincode: '' });
          }}
          placeholder="Search Area or Enter Pincode"
          className="w-full bg-white border border-navy/20 text-navy text-lg p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-navy/30 shadow-sm"
        />
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-navy/15 max-h-60 overflow-y-auto z-10 shadow-lg">
            {results.map((loc, i) => (
              <button
                key={i}
                onClick={() => selectLocation(loc)}
                className="w-full text-left px-4 py-3 text-navy hover:bg-navy/5 transition-colors flex justify-between cursor-pointer"
              >
                <span>{loc.name}</span>
                <span className="text-navy/40 text-sm">{loc.pincode}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button onClick={prevStep} className="text-navy/50 hover:text-navy text-xs uppercase tracking-widest cursor-pointer transition-colors">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!formData.preferredLocation.trim()}
          className="bg-primary text-navy font-bold uppercase text-xs tracking-[0.2em] px-10 py-4 hover:bg-primary/80 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-sm"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
