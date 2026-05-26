import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import {
  Search,
  Users,
  MessageCircle,
  StickyNote,
  CheckCircle2,
  Star,
  Loader2,
  Plus,
  Bell,
  Activity,
  X,
  Phone,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

interface CombinedLead {
  id: string;
  lead_type: 'owner' | 'tenant';
  full_name: string;
  phone: string;
  whatsapp: string;
  status: string;
  lead_score: number;
  created_at: string;
  location?: string;
  budget_type?: string;
  property_type?: string | string[];
}

type ActiveTab = 'timeline' | 'notes' | 'reminders';

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────

export default function UnifiedInbox() {
  const [leads, setLeads] = useState<CombinedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<CombinedLead | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newReminder, setNewReminder] = useState({ title: '', due_date: '' });
  const [loading, setLoading] = useState(true);
  const [crmLoading, setCrmLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [scoreEdit, setScoreEdit] = useState(50);
  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [savingScore, setSavingScore] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [addingReminder, setAddingReminder] = useState(false);

  // ── Fetch combined leads ──────────────────────────────
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const [ownersRes, tenantsRes] = await Promise.all([
      supabase
        .from('owner_leads')
        .select('id, full_name, phone, whatsapp, status, lead_score, created_at, location, property_type')
        .order('created_at', { ascending: false }),
      supabase
        .from('instagram_leads')
        .select('id, full_name, whatsapp_number, status, lead_score, created_at, preferred_location, budget_type, property_type')
        .order('created_at', { ascending: false }),
    ]);

    const owners: CombinedLead[] = (ownersRes.data || []).map((o: any) => ({
      ...o,
      lead_type: 'owner' as const,
      phone: o.phone || o.whatsapp || '',
      whatsapp: o.whatsapp || o.phone || '',
      lead_score: o.lead_score ?? 50,
    }));

    const tenants: CombinedLead[] = (tenantsRes.data || []).map((t: any) => ({
      ...t,
      lead_type: 'tenant' as const,
      phone: t.whatsapp_number || '',
      whatsapp: t.whatsapp_number || '',
      location: t.preferred_location || '',
      lead_score: t.lead_score ?? 50,
    }));

    const combined = [...owners, ...tenants].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setLeads(combined);
    setLoading(false);
  };

  // ── Select a lead and load CRM data ──────────────────
  const selectLead = async (lead: CombinedLead) => {
    setSelectedLead(lead);
    setScoreEdit(lead.lead_score ?? 50);
    setActiveTab('timeline');
    setCrmLoading(true);

    const [notesRes, remindersRes, timelineRes] = await Promise.all([
      supabase
        .from('crm_notes')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('lead_type', lead.lead_type)
        .order('created_at', { ascending: false }),
      supabase
        .from('crm_reminders')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('lead_type', lead.lead_type)
        .order('due_date', { ascending: true }),
      supabase
        .from('crm_timeline')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('lead_type', lead.lead_type)
        .order('created_at', { ascending: false }),
    ]);

    setNotes(notesRes.data || []);
    setReminders(remindersRes.data || []);
    setTimeline(timelineRes.data || []);
    setCrmLoading(false);
  };

  // ── Reload CRM data for selected lead ────────────────
  const refreshCrmData = async () => {
    if (!selectedLead) return;
    const [notesRes, remindersRes, timelineRes] = await Promise.all([
      supabase
        .from('crm_notes')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .eq('lead_type', selectedLead.lead_type)
        .order('created_at', { ascending: false }),
      supabase
        .from('crm_reminders')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .eq('lead_type', selectedLead.lead_type)
        .order('due_date', { ascending: true }),
      supabase
        .from('crm_timeline')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .eq('lead_type', selectedLead.lead_type)
        .order('created_at', { ascending: false }),
    ]);
    setNotes(notesRes.data || []);
    setReminders(remindersRes.data || []);
    setTimeline(timelineRes.data || []);
  };

  // ── Add Note ─────────────────────────────────────────
  const addNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setAddingNote(true);
    const { error } = await supabase.from('crm_notes').insert({
      lead_id: selectedLead.id,
      lead_type: selectedLead.lead_type,
      note: newNote.trim(),
    });
    if (error) {
      toast.error('Failed to add note: ' + error.message);
      setAddingNote(false);
      return;
    }
    await supabase.from('crm_timeline').insert({
      lead_id: selectedLead.id,
      lead_type: selectedLead.lead_type,
      event_type: 'note_added',
      event_detail: newNote.trim().slice(0, 80) + (newNote.trim().length > 80 ? '…' : ''),
    });
    setNewNote('');
    toast.success('Note added.');
    await refreshCrmData();
    setAddingNote(false);
  };

  // ── Add Reminder ──────────────────────────────────────
  const addReminder = async () => {
    if (!selectedLead || !newReminder.title.trim() || !newReminder.due_date) return;
    setAddingReminder(true);
    const { error } = await supabase.from('crm_reminders').insert({
      lead_id: selectedLead.id,
      lead_type: selectedLead.lead_type,
      title: newReminder.title.trim(),
      due_date: newReminder.due_date,
    });
    if (error) {
      toast.error('Failed to add reminder: ' + error.message);
      setAddingReminder(false);
      return;
    }
    await supabase.from('crm_timeline').insert({
      lead_id: selectedLead.id,
      lead_type: selectedLead.lead_type,
      event_type: 'reminder_set',
      event_detail: `"${newReminder.title.trim()}" due ${format(new Date(newReminder.due_date), 'dd MMM yyyy')}`,
    });
    setNewReminder({ title: '', due_date: '' });
    toast.success('Reminder set.');
    await refreshCrmData();
    setAddingReminder(false);
  };

  // ── Toggle Reminder ───────────────────────────────────
  const toggleReminder = async (id: string, currentValue: boolean) => {
    await supabase.from('crm_reminders').update({ completed: !currentValue }).eq('id', id);
    await refreshCrmData();
  };

  // ── Open WhatsApp + log timeline ──────────────────────
  const openWhatsApp = async (lead: CombinedLead) => {
    const number = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
    const text =
      lead.lead_type === 'owner'
        ? `Hi ${lead.full_name}, this is Quest Housing Bangalore. We'd like to discuss listing your property. When would be a good time to connect? 🏠`
        : `Hi ${lead.full_name}, this is Quest Housing Bangalore. We received your requirement and our team is on it! 🏠`;
    window.open(`https://wa.me/91${number}?text=${encodeURIComponent(text)}`, '_blank');

    await supabase.from('crm_timeline').insert({
      lead_id: lead.id,
      lead_type: lead.lead_type,
      event_type: 'whatsapp_opened',
      event_detail: `Opened WhatsApp for +91${number}`,
    });
    await refreshCrmData();
  };

  // ── Update Lead Score ─────────────────────────────────
  const updateScore = async () => {
    if (!selectedLead) return;
    setSavingScore(true);
    const table = selectedLead.lead_type === 'owner' ? 'owner_leads' : 'instagram_leads';
    const { error } = await supabase.from(table).update({ lead_score: scoreEdit }).eq('id', selectedLead.id);
    if (error) {
      toast.error('Failed to update score: ' + error.message);
    } else {
      toast.success(`Lead score updated to ${scoreEdit}`);
      // Update in local list too
      setLeads(prev =>
        prev.map(l =>
          l.id === selectedLead.id && l.lead_type === selectedLead.lead_type
            ? { ...l, lead_score: scoreEdit }
            : l
        )
      );
      setSelectedLead(prev => prev ? { ...prev, lead_score: scoreEdit } : prev);
    }
    setSavingScore(false);
  };

  // ── Filtered leads ────────────────────────────────────
  const filteredLeads = leads.filter(l => {
    const q = search.toLowerCase();
    return (
      (l.full_name || '').toLowerCase().includes(q) ||
      (l.phone || '').includes(q) ||
      (l.location || '').toLowerCase().includes(q)
    );
  });

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-1 flex items-center gap-3">
            <Users className="text-primary" />
            Unified Inbox
          </h2>
          <p className="text-navy/50 text-sm">
            {leads.length} total leads across all channels
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 bg-navy/5 hover:bg-navy/10 text-navy text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
          Refresh
        </button>
      </div>

      {/* ── Dual Pane ── */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">

        {/* ════ LEFT PANE: Lead List ════ */}
        <div className="w-80 shrink-0 flex flex-col bg-white rounded-2xl border border-navy/5 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-navy/5 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
              <input
                type="text"
                placeholder="Search name, phone, location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-navy/5 rounded-lg text-sm text-navy focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-navy/30"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/30 hover:text-navy"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Lead count badge */}
          <div className="px-4 py-2 border-b border-navy/5 shrink-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold">
              {filteredLeads.length} leads
            </p>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={24} className="animate-spin text-navy/30" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-navy/30">
                <Users size={32} />
                <p className="text-xs uppercase tracking-widest font-bold">No leads found</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredLeads.map(lead => (
                  <motion.div
                    key={`${lead.lead_type}-${lead.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => selectLead(lead)}
                    className={`p-4 border-b border-navy/5 cursor-pointer transition-all hover:bg-navy/5 ${
                      selectedLead?.id === lead.id && selectedLead?.lead_type === lead.lead_type
                        ? 'bg-navy/10 border-l-2 border-l-primary'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="font-medium text-sm text-navy truncate">{lead.full_name}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                          lead.lead_type === 'owner'
                            ? 'bg-navy/10 text-navy'
                            : 'bg-primary/20 text-navy'
                        }`}
                      >
                        {lead.lead_type === 'owner' ? 'Owner' : 'Tenant'}
                      </span>
                    </div>
                    <p className="text-xs text-navy/40 truncate">{lead.phone || '—'}</p>
                    {lead.location && (
                      <p className="text-xs text-navy/30 truncate mt-0.5">{lead.location}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-navy/40">
                        {format(new Date(lead.created_at), 'dd MMM yyyy')}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] font-bold text-navy">{lead.lead_score ?? 50}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* ════ RIGHT PANE: Lead Detail ════ */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-navy/5 shadow-sm overflow-hidden min-w-0">
          {!selectedLead ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-4 text-navy/30">
              <Users size={48} />
              <p className="text-sm uppercase tracking-widest font-bold">Select a lead to view details</p>
            </div>
          ) : (
            <>
              {/* ── Lead Header ── */}
              <div className="p-6 border-b border-navy/5 shrink-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="text-2xl font-display text-navy font-medium tracking-tight">
                        {selectedLead.full_name}
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-widest ${
                          selectedLead.lead_type === 'owner'
                            ? 'bg-navy/10 text-navy'
                            : 'bg-primary/20 text-navy'
                        }`}
                      >
                        {selectedLead.lead_type === 'owner' ? 'Owner' : 'Tenant'}
                      </span>
                      {selectedLead.status && (
                        <span className="text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-200">
                          {selectedLead.status}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      {selectedLead.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-navy/60">
                          <Phone size={12} />
                          <span>{selectedLead.phone}</span>
                        </div>
                      )}
                      {selectedLead.location && (
                        <p className="text-sm text-navy/60">📍 {selectedLead.location}</p>
                      )}
                      {selectedLead.budget_type && (
                        <p className="text-sm text-navy/60">💰 {selectedLead.budget_type}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Lead Score */}
                    <div className="flex items-center gap-2 bg-navy/5 rounded-xl px-3 py-2">
                      <Star size={14} className="text-primary fill-primary shrink-0" />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={scoreEdit}
                        onChange={e => setScoreEdit(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-12 bg-transparent text-navy text-sm font-bold focus:outline-none text-center"
                      />
                      <button
                        onClick={updateScore}
                        disabled={savingScore}
                        className="text-[10px] font-bold uppercase tracking-widest text-navy/50 hover:text-navy transition-colors disabled:opacity-50"
                      >
                        {savingScore ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                      </button>
                    </div>

                    {/* WhatsApp */}
                    <button
                      onClick={() => openWhatsApp(selectedLead)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Tabs ── */}
              <div className="flex border-b border-navy/5 shrink-0 px-6">
                {(['timeline', 'notes', 'reminders'] as ActiveTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                      activeTab === tab
                        ? 'text-navy border-b-2 border-navy'
                        : 'text-navy/40 hover:text-navy/70'
                    }`}
                  >
                    {tab === 'timeline' && <Activity size={13} />}
                    {tab === 'notes' && <StickyNote size={13} />}
                    {tab === 'reminders' && (
                      <div className="relative">
                        <Bell size={13} />
                        {reminders.filter(r => !r.completed).length > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full text-[7px] font-bold text-navy flex items-center justify-center">
                            {reminders.filter(r => !r.completed).length}
                          </span>
                        )}
                      </div>
                    )}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* ── Tab Content ── */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {crmLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-navy/30" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {/* ── TIMELINE TAB ── */}
                    {activeTab === 'timeline' && (
                      <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-6"
                      >
                        {timeline.length === 0 ? (
                          <EmptyState icon={<Activity size={32} />} label="No activity yet" />
                        ) : (
                          <div className="space-y-0">
                            {timeline.map((event, i) => (
                              <div
                                key={event.id}
                                className={`flex gap-3 pb-5 ${i < timeline.length - 1 ? 'border-b border-navy/5 mb-5' : ''}`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    event.event_type === 'whatsapp_opened'
                                      ? 'bg-green-100 text-green-600'
                                      : event.event_type === 'note_added'
                                      ? 'bg-blue-100 text-blue-600'
                                      : event.event_type === 'reminder_set'
                                      ? 'bg-yellow-100 text-yellow-600'
                                      : 'bg-navy/5 text-navy/50'
                                  }`}
                                >
                                  {event.event_type === 'whatsapp_opened' ? (
                                    <MessageCircle size={14} />
                                  ) : event.event_type === 'note_added' ? (
                                    <StickyNote size={14} />
                                  ) : event.event_type === 'reminder_set' ? (
                                    <Bell size={14} />
                                  ) : (
                                    <Activity size={14} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold uppercase tracking-widest text-navy">
                                    {event.event_type.replace(/_/g, ' ')}
                                  </p>
                                  {event.event_detail && (
                                    <p className="text-xs text-navy/50 mt-0.5 break-words">{event.event_detail}</p>
                                  )}
                                  <p className="text-[10px] text-navy/30 mt-1">
                                    {format(new Date(event.created_at), 'dd MMM yyyy, h:mm a')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── NOTES TAB ── */}
                    {activeTab === 'notes' && (
                      <motion.div
                        key="notes"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-6"
                      >
                        {/* Add note */}
                        <div className="mb-6">
                          <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">
                            Add Note
                          </label>
                          <textarea
                            value={newNote}
                            onChange={e => setNewNote(e.target.value)}
                            placeholder="Write a note about this lead..."
                            rows={3}
                            className="w-full bg-white border border-navy/10 text-navy text-sm p-3 rounded-xl focus:border-primary focus:outline-none resize-none placeholder:text-navy/30"
                          />
                          <button
                            onClick={addNote}
                            disabled={addingNote || !newNote.trim()}
                            className="mt-2 flex items-center gap-2 bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
                          >
                            {addingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            Add Note
                          </button>
                        </div>

                        {/* Notes list */}
                        {notes.length === 0 ? (
                          <EmptyState icon={<StickyNote size={32} />} label="No notes yet" />
                        ) : (
                          <div className="space-y-3">
                            {notes.map(note => (
                              <div key={note.id} className="bg-navy/5 rounded-xl p-4">
                                <p className="text-sm text-navy whitespace-pre-wrap break-words">{note.note}</p>
                                <p className="text-[10px] text-navy/40 mt-2">
                                  {format(new Date(note.created_at), 'dd MMM yyyy, h:mm a')}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── REMINDERS TAB ── */}
                    {activeTab === 'reminders' && (
                      <motion.div
                        key="reminders"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-6"
                      >
                        {/* Add reminder */}
                        <div className="mb-6">
                          <label className="text-[10px] uppercase tracking-[0.3em] text-navy/50 font-bold block mb-2">
                            Set Reminder
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="text"
                              value={newReminder.title}
                              onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))}
                              placeholder="Reminder title..."
                              className="flex-1 min-w-0 bg-white border border-navy/10 text-navy text-sm p-3 rounded-xl focus:border-primary focus:outline-none placeholder:text-navy/30"
                            />
                            <input
                              type="datetime-local"
                              value={newReminder.due_date}
                              onChange={e => setNewReminder(p => ({ ...p, due_date: e.target.value }))}
                              className="bg-white border border-navy/10 text-navy text-sm p-3 rounded-xl focus:border-primary focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={addReminder}
                            disabled={addingReminder || !newReminder.title.trim() || !newReminder.due_date}
                            className="mt-2 flex items-center gap-2 bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-5 py-2.5 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
                          >
                            {addingReminder ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                            Set Reminder
                          </button>
                        </div>

                        {/* Reminders list */}
                        {reminders.length === 0 ? (
                          <EmptyState icon={<Bell size={32} />} label="No reminders set" />
                        ) : (
                          <div className="space-y-2">
                            {reminders.map(reminder => {
                              const isOverdue = !reminder.completed && isPast(new Date(reminder.due_date));
                              return (
                                <div
                                  key={reminder.id}
                                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                                    reminder.completed
                                      ? 'bg-navy/5 border-navy/5 opacity-60'
                                      : isOverdue
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-white border-navy/10'
                                  }`}
                                >
                                  <button
                                    onClick={() => toggleReminder(reminder.id, reminder.completed)}
                                    className={`shrink-0 mt-0.5 transition-colors ${
                                      reminder.completed
                                        ? 'text-green-500'
                                        : isOverdue
                                        ? 'text-red-400 hover:text-green-500'
                                        : 'text-navy/30 hover:text-green-500'
                                    }`}
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-medium ${
                                        reminder.completed
                                          ? 'line-through text-navy/40'
                                          : isOverdue
                                          ? 'text-red-700'
                                          : 'text-navy'
                                      }`}
                                    >
                                      {reminder.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p
                                        className={`text-[10px] font-bold uppercase tracking-widest ${
                                          reminder.completed
                                            ? 'text-navy/30'
                                            : isOverdue
                                            ? 'text-red-500'
                                            : 'text-navy/40'
                                        }`}
                                      >
                                        {isOverdue && !reminder.completed ? '⚠ Overdue — ' : ''}
                                        {format(new Date(reminder.due_date), 'dd MMM yyyy, h:mm a')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Empty State Helper
// ─────────────────────────────────────────────────────────

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-navy/30">
      {icon}
      <p className="text-xs uppercase tracking-widest font-bold">{label}</p>
    </div>
  );
}
