import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export type LeadStatus = 'Pending' | 'Contacted' | 'Completed' | 'Cancelled' | 'Confirmed';

interface StatusSelectorProps {
  currentStatus: string;
  leadId: string;
  table: 'owner_leads' | 'tenant_leads' | 'instagram_leads' | 'visit_slots';
}

export function StatusSelector({ currentStatus, leadId, table }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>((currentStatus as LeadStatus) || 'Pending');

  // Define different status options based on table type
  const statuses: LeadStatus[] = table === 'visit_slots' 
    ? ['Pending', 'Confirmed', 'Completed', 'Cancelled']
    : ['Pending', 'Contacted', 'Completed'];

  const handleUpdate = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    setIsOpen(false);
    
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      toast.error(`Failed to update status: ${error.message}`);
      // Revert optically
      setStatus((currentStatus as LeadStatus) || 'Pending'); 
    } else {
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  const getBadgeColors = (s: string) => {
    switch (s) {
      case 'Pending': return 'bg-amber-100/80 text-amber-800 border-amber-200';
      case 'Contacted': return 'bg-blue-100/80 text-blue-800 border-blue-200';
      case 'Completed': return 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
      case 'Cancelled': return 'bg-red-100/80 text-red-600 border-red-200';
      default: return 'bg-gray-100/80 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm transition-all hover:shadow-sm ${getBadgeColors(status)}`}
      >
        {status}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl border border-navy/10 rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div className="py-1">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => handleUpdate(s)}
                    className="flex justify-between items-center w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-navy hover:bg-navy/5 transition-colors"
                  >
                    {s}
                    {status === s && <Check size={14} className="text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
