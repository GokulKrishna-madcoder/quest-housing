import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLeadFormStore } from '../../store/useLeadFormStore';
import StepName from './steps/StepName';
import StepBudget from './steps/StepBudget';
import StepLocation from './steps/StepLocation';
import StepMoveIn from './steps/StepMoveIn';
import StepPropertyType from './steps/StepPropertyType';
import StepFurnishing from './steps/StepFurnishing';
import StepContact from './steps/StepContact';
import StepSuccess from './steps/StepSuccess';

const STEPS = [StepName, StepBudget, StepLocation, StepMoveIn, StepPropertyType, StepFurnishing, StepContact, StepSuccess];
const TOTAL = STEPS.length;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function FunnelLayout() {
  const { currentStep, updateData } = useLeadFormStore();
  const StepComponent = STEPS[currentStep];
  const progress = ((currentStep + 1) / TOTAL) * 100;
  const stepLabel = String(currentStep + 1).padStart(2, '0');

  // Capture UTM params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || params.get('ref') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    
    if (utmSource || utmMedium || utmCampaign) {
      updateData({ utmSource, utmMedium, utmCampaign });
    }
  }, []);

  return (
    <div className="min-h-screen bg-light relative flex flex-col stitch-grid">
      {/* Progress bar */}
      <div className="relative z-10">
        <div className="h-1 bg-navy/10 w-full">
          <motion.div
            className="h-full bg-primary"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        {currentStep < TOTAL - 1 && (
          <p className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold text-center mt-4">
            STEP {stepLabel} / {String(TOTAL).padStart(2, '0')}
          </p>
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center relative z-10 py-16">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
