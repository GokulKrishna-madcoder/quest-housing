import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function DeleteModal({ isOpen, onClose, onConfirm, title = "Delete Lead", message = "Are you sure you want to delete this lead? This action cannot be undone." }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-md cursor-pointer z-0" 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/20"
          >
            <div className="p-8">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-inner">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-display font-medium text-navy mb-2">{title}</h3>
              <p className="text-sm text-navy/60 leading-relaxed font-sans">{message}</p>
            </div>
            <div className="px-8 py-5 bg-navy/5 border-t border-navy/5 flex items-center justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-navy/70 hover:bg-navy/10 hover:text-navy transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
