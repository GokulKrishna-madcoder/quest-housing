import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, StickyNote } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  table: 'tenant_leads' | 'owner_leads' | 'instagram_leads' | 'visit_slots';  // Extended to support visit_slots
}

export function NotesDrawer({ isOpen, onClose, lead, table }: NotesDrawerProps) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
    }
  }, [lead]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from(table)
        .update({ notes })
        .eq('id', lead.id);
      if (error) throw error;
      toast.success('Notes saved.');
      onClose();
    } catch (err: any) {
      toast.error('Failed to save notes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const leadName = lead?.full_name || 'Lead';
  const leadPhone = lead?.phone || lead?.whatsapp_number || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-navy/10 flex items-center justify-between bg-light">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center">
                  <StickyNote size={18} className="text-navy" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-medium text-navy">{leadName}</h3>
                  <p className="text-xs text-navy/50">{leadPhone}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-navy/5 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-navy/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-3">
                CRM Notes & Follow-up Log
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log call notes, follow-ups, scheduling details..."
                rows={12}
                className="w-full bg-white border border-navy/15 text-navy text-sm p-4 focus:border-primary focus:outline-none transition-colors placeholder:text-navy/30 resize-none rounded-lg"
              />
              <p className="text-[10px] text-navy/30 mt-2">
                Tip: Use timestamps like [May 24] to track interactions over time.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-navy/10 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="text-navy/50 hover:text-navy text-xs uppercase tracking-widest cursor-pointer transition-colors px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-3 rounded-lg hover:bg-navy/90 transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? 'Saving…' : 'Save Notes'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
