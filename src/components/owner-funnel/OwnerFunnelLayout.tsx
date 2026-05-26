import { motion, AnimatePresence } from 'motion/react';
import { useOwnerFormStore } from '../../store/useOwnerFormStore';
import StepName from './steps/StepName';
import StepContact from './steps/StepContact';
import StepPropertyType from './steps/StepPropertyType';
import StepLocation from './steps/StepLocation';
import StepDetails from './steps/StepDetails';
import StepImages from './steps/StepImages';
import StepSuccess from './steps/StepSuccess';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function OwnerFunnelLayout({ onClose }: { onClose: () => void }) {
  const currentStep = useOwnerFormStore((state) => state.currentStep);
  const updateData = useOwnerFormStore((state) => state.updateData);
  const totalSteps = 7;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || params.get('ref') || '';
    const utmMedium = params.get('utm_medium') || '';
    const utmCampaign = params.get('utm_campaign') || '';
    
    if (utmSource || utmMedium || utmCampaign) {
      updateData({ utmSource, utmMedium, utmCampaign });
    }
  }, []);

  const steps = [
    <StepName key="name" />,
    <StepContact key="contact" />,
    <StepPropertyType key="type" />,
    <StepLocation key="location" />,
    <StepDetails key="details" />,
    <StepImages key="images" />,
    <StepSuccess key="success" onClose={onClose} />
  ];

  const progress = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-navy stitch-grid-dark flex flex-col overflow-y-auto">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-6">
        {currentStep < totalSteps - 1 && (
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-bold">
            STEP 0{currentStep + 1} / 0{totalSteps - 1}
          </div>
        )}
        <button 
          onClick={onClose}
          className="ml-auto p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-6">
        <AnimatePresence mode="wait">
          {steps[currentStep]}
        </AnimatePresence>
      </div>
    </div>
  );
}
