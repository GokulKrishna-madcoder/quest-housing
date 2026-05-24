import { create } from 'zustand';

interface OwnerFormData {
  fullName: string;
  phone: string;
  email: string;
  whatsapp: string;
  propertyType: string;
  location: string;
  description: string;
  images: File[];
}

interface OwnerFormState {
  currentStep: number;
  formData: OwnerFormData;
  updateData: (data: Partial<OwnerFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialData: OwnerFormData = {
  fullName: '',
  phone: '',
  email: '',
  whatsapp: '',
  propertyType: '',
  location: '',
  description: '',
  images: [],
};

export const useOwnerFormStore = create<OwnerFormState>((set) => ({
  currentStep: 0,
  formData: initialData,
  updateData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  setStep: (step) => set({ currentStep: step }),
  reset: () => set({ currentStep: 0, formData: initialData }),
}));
