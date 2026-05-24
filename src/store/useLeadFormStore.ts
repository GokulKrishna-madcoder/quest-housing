import { create } from 'zustand';

export interface LeadFormData {
  fullName: string;
  whatsappNumber: string;
  budgetType: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocation: string;
  preferredPincode: string;
  moveInType: string;
  moveInDate: string;
  propertyType: string[];
  furnishingType: string[];
  utmSource: string;
}

interface LeadFormStore {
  currentStep: number;
  formData: LeadFormData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<LeadFormData>) => void;
  reset: () => void;
}

const initialData: LeadFormData = {
  fullName: '',
  whatsappNumber: '',
  budgetType: '',
  budgetMin: 5000,
  budgetMax: 100000,
  preferredLocation: '',
  preferredPincode: '',
  moveInType: '',
  moveInDate: '',
  propertyType: [],
  furnishingType: [],
  utmSource: '',
};

export const useLeadFormStore = create<LeadFormStore>((set) => ({
  currentStep: 0,
  formData: { ...initialData },
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),
  updateData: (data) => set((s) => ({ formData: { ...s.formData, ...data } })),
  reset: () => set({ currentStep: 0, formData: { ...initialData } }),
}));
