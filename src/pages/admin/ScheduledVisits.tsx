import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, FileText, Filter, Trash2, MessageCircle, Phone, Edit2, X, Calendar, Clock, Check, Send, CalendarCheck, CalendarX, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../lib/supabase';
import { DeleteModal } from '../../components/admin/DeleteModal';
import { toast } from 'sonner';

// Status config
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  Pending: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  Confirmed: { color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CalendarCheck },
  Rescheduled: { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Calendar },
  Cancelled: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: CalendarX },
};

// WhatsApp templates
function getWhatsAppTemplate(visit: any, status: string): string {
  const name = visit.lead_name || 'there';
  const property = visit.property?.title || 'the property';
  const confirmedDate = visit.confirmed_date ? format(new Date(visit.confirmed_date), 'dd MMM yyyy') : '';
  const confirmedTime = visit.confirmed_time || visit.preferred_time || '';

  switch (status) {
    case 'Confirmed':
      return `Hi ${name} 👋,\n\nYour visit to *${property}* has been confirmed! ✅\n\n📅 Date: ${confirmedDate}\n🕐 Time: ${confirmedTime}\n\nPlease be on time. Our team will meet you at the location.\n\nFor any changes, reply to this message.\n\n— Quest Housing Bangalore`;
    case 'Rescheduled':
      return `Hi ${name} 👋,\n\nWe needed to reschedule your visit to *${property}*.\n\n📅 New Date: ${confirmedDate}\n🕐 New Time: ${confirmedTime}\n\nPlease confirm if this works for you by replying to this message.\n\n— Quest Housing Bangalore`;
    case 'Cancelled':
      return `Hi ${name},\n\nUnfortunately, we had to cancel your visit to *${property}*. We apologize for the inconvenience.\n\nWould you like to reschedule? Reply here or call us at 8886131316.\n\n— Quest Housing Bangalore`;
    default:
      return `Hi ${name} 👋,\n\nThank you for your interest in *${property}*! We received your visit request.\n\nOur team will confirm your preferred slot shortly.\n\n— Quest Housing Bangalore`;
  }
}

export default function ScheduledVisits() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);

  // Edit modal state
  const [editVisit, setEditVisit] = useState<any | null>(null);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editConfirmedDate, setEditConfirmedDate] = useState('');
  const [editConfirmedTime, setEditConfirmedTime] = useState('');
  const [saving, setSaving] = useState(false);

  // WhatsApp modal state
  const [waVisit, setWaVisit] = useState<any | null>(null);
  const [waMessage, setWaMessage] = useState('');

  // Fetch visit slots with property data
  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('visit_slots')
        .select('*, property:property_id(id, title, bhk, locality)')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching visits', error);
      } else {
        setVisits(data || []);
      }
      setLoading(false);
    };
    fetchVisits();

    // Realtime subscription
    const channel = supabase
      .channel('visit_slots_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visit_slots' }, () => {
        fetchVisits();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredVisits = visits.filter(v =>
    (statusFilter === 'All' || (v.status || 'Pending') === statusFilter) &&
    ((v.lead_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (v.lead_phone || '').includes(search))
  );

  // Stats
  const totalVisits = visits.length;
  const pendingCount = visits.filter(v => !v.status || v.status === 'Pending').length;
  const confirmedCount = visits.filter(v => v.status === 'Confirmed').length;
  const thisWeekCount = visits.filter(v => {
    const d = new Date(v.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Open edit modal
  const openEdit = (v: any) => {
    setEditVisit(v);
    setEditStatus(v.status || 'Pending');
    setEditConfirmedDate(v.confirmed_date || '');
    setEditConfirmedTime(v.confirmed_time || v.preferred_time || 'morning');
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editVisit) return;
    setSaving(true);
    const { error } = await supabase
      .from('visit_slots')
      .update({
        status: editStatus,
        confirmed_date: editConfirmedDate || null,
        confirmed_time: editConfirmedTime || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editVisit.id);
    if (error) {
      toast.error('Failed to update: ' + error.message);
    } else {
      toast.success('Visit updated successfully!');
      setVisits(prev => prev.map(v => v.id === editVisit.id ? { ...v, status: editStatus, confirmed_date: editConfirmedDate || null, confirmed_time: editConfirmedTime || null } : v));
      setEditVisit(null);
    }
    setSaving(false);
  };

  // Open WhatsApp modal
  const openWhatsApp = (v: any) => {
    setWaVisit(v);
    setWaMessage(getWhatsAppTemplate(v, v.status || 'Pending'));
  };

  // Send WhatsApp
  const sendWhatsApp = () => {
    if (!waVisit) return;
    const phone = (waVisit.lead_phone || '').replace(/\D/g, '');
    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
    setWaVisit(null);
  };

  const exportCSV = () => {
    const headers = ['Lead Name', 'Phone', 'Preferred Dates', 'Preferred Time', 'Confirmed Date', 'Confirmed Time', 'Property', 'Status', 'Created At'];
    const rows = visits.map(v => [
      v.lead_name,
      v.lead_phone,
      [v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map(d => format(new Date(d), 'yyyy-MM-dd')).join(' | '),
      v.preferred_time || '-',
      v.confirmed_date ? format(new Date(v.confirmed_date), 'yyyy-MM-dd') : '-',
      v.confirmed_time || '-',
      v.property?.title || v.property?.id,
      v.status || 'Pending',
      format(new Date(v.created_at), 'PPP')
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'scheduled_visits.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(22, 27, 64);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Quest Housing - Scheduled Visits', 14, 20);
    const tableData = visits.map(v => [
      v.lead_name,
      v.lead_phone,
      [v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map(d => format(new Date(d), 'MMM dd')).join(' | '),
      v.preferred_time || '-',
      v.confirmed_date ? format(new Date(v.confirmed_date), 'MMM dd') : '-',
      v.confirmed_time || '-',
      v.property?.title || '-',
      v.status || 'Pending',
    ]);
    autoTable(doc, {
      head: [['Lead', 'Phone', 'Pref. Dates', 'Pref. Time', 'Conf. Date', 'Conf. Time', 'Property', 'Status']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 27, 64] },
    });
    doc.save('scheduled_visits.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-1">Scheduled Visits</h2>
          <p className="text-navy/50 text-sm">Manage visit requests, confirm dates, and send WhatsApp updates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy appearance-none font-medium text-navy cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-navy/90 transition-colors cursor-pointer">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-primary text-navy px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors cursor-pointer">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Visits', value: totalVisits, color: 'border-t-navy' },
          { label: 'Pending', value: pendingCount, color: 'border-t-amber-400' },
          { label: 'Confirmed', value: confirmedCount, color: 'border-t-green-500' },
          { label: 'This Week', value: thisWeekCount, color: 'border-t-primary' },
        ].map(stat => (
          <div key={stat.label} className={`p-5 bg-white rounded-2xl border border-navy/5 shadow-sm border-t-[3px] ${stat.color}`}>
            <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold mb-1">{stat.label}</p>
            <p className="text-3xl font-display font-medium text-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-stitch shadow-xl h-[62vh] flex flex-col relative stitch-grid overflow-hidden">
        <div className="overflow-auto flex-1 hide-scrollbar pb-32">
          <table className="w-full text-left text-sm bg-white/90 backdrop-blur-md">
            <thead className="bg-navy/5 border-stitch-b text-xs uppercase tracking-widest text-navy/60 font-bold sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-5 py-4">Lead</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Preferred Dates</th>
                <th className="px-5 py-4">Confirmed</th>
                <th className="px-5 py-4">Property</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-navy/50">Loading visits...</td></tr>
              ) : filteredVisits.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-navy/50">No visits found.</td></tr>
              ) : (
                filteredVisits.map(v => {
                  const statusKey = v.status || 'Pending';
                  const sc = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending;
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={v.id} className="hover:bg-navy/[0.02] transition-colors group">
                      <td className="px-5 py-4">
                        <p className="font-medium text-navy">{v.lead_name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-navy font-medium text-xs mb-1.5">{v.lead_phone}</p>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openWhatsApp(v)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            <MessageCircle size={11} /> WA
                          </button>
                          <a
                            href={`tel:+91${(v.lead_phone || '').replace(/\D/g, '')}`}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded transition-colors"
                          >
                            <Phone size={11} /> Call
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          {[v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map((d, i) => (
                            <span key={i} className="text-xs text-navy/60 bg-navy/5 px-2 py-0.5 rounded inline-block w-fit">
                              {format(new Date(d), 'dd MMM')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {v.confirmed_date ? (
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded inline-block">
                              {format(new Date(v.confirmed_date), 'dd MMM')}
                            </span>
                            {v.confirmed_time && (
                              <p className="text-[10px] text-navy/40 capitalize">{v.confirmed_time}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-navy/30">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={`/properties/${v.property?.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-navy hover:text-primary transition-colors underline decoration-navy/20 hover:decoration-primary"
                        >
                          {v.property?.title || v.property?.id || '-'}
                        </a>
                        {v.property?.locality && (
                          <p className="text-[10px] text-navy/30 mt-0.5">{v.property.locality}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${sc.color} ${sc.bg} ${sc.border}`}>
                          <StatusIcon size={12} />
                          {statusKey}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-navy/50 text-xs">{format(new Date(v.created_at), 'dd MMM')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(v)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-navy bg-navy/5 hover:bg-navy/10 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setVisitToDelete(v.id)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal isOpen={!!visitToDelete} onClose={() => setVisitToDelete(null)} onConfirm={() => {
        if (visitToDelete) {
          supabase.from('visit_slots').delete().eq('id', visitToDelete).then(() => {
            setVisits(prev => prev.filter(v => v.id !== visitToDelete));
            toast.success('Visit deleted.');
          });
          setVisitToDelete(null);
        }
      }} />

      {/* ═══ EDIT VISIT MODAL ═══ */}
      <AnimatePresence>
        {editVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !saving && setEditVisit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md shadow-2xl border-stitch relative"
            >
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>
              <div className="cross-mark bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-navy"></div>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-stitch-b flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold mb-1">Manage Visit</p>
                  <h3 className="text-xl font-display font-medium text-navy">{editVisit.lead_name}</h3>
                  <p className="text-xs text-navy/40 mt-0.5">{editVisit.property?.title || ''}</p>
                </div>
                <button onClick={() => !saving && setEditVisit(null)} className="w-9 h-9 border border-navy/10 flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-all cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Preferred dates display */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Visitor's Preferred Dates</label>
                  <div className="flex flex-wrap gap-2">
                    {[editVisit.preferred_date_1, editVisit.preferred_date_2, editVisit.preferred_date_3].filter(Boolean).map((d: string, i: number) => (
                      <span key={i} className="text-xs font-bold bg-navy/5 text-navy px-3 py-1.5 rounded">
                        {format(new Date(d), 'dd MMM yyyy')}
                      </span>
                    ))}
                    <span className="text-xs text-navy/40 px-2 py-1.5 capitalize">{editVisit.preferred_time}</span>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, conf]) => {
                      const Icon = conf.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setEditStatus(key)}
                          className={`flex items-center gap-2 px-4 py-3 border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            editStatus === key
                              ? `${conf.bg} ${conf.border} ${conf.color} shadow-sm`
                              : 'border-navy/10 text-navy/40 hover:border-navy/20'
                          }`}
                        >
                          <Icon size={14} />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirmed Date */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Confirmed Date</label>
                  <input
                    type="date"
                    value={editConfirmedDate}
                    onChange={e => setEditConfirmedDate(e.target.value)}
                    className="w-full bg-white border border-navy/10 text-navy text-sm p-3 focus:border-navy focus:outline-none transition-colors"
                  />
                </div>

                {/* Confirmed Time */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Confirmed Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'morning', label: 'Morning' },
                      { value: 'afternoon', label: 'Afternoon' },
                      { value: 'evening', label: 'Evening' },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setEditConfirmedTime(t.value)}
                        className={`py-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          editConfirmedTime === t.value
                            ? 'bg-navy text-white'
                            : 'bg-navy/5 text-navy/40 hover:bg-navy/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditVisit(null)}
                    className="px-6 py-3.5 border border-navy/10 text-navy/50 font-bold uppercase text-xs tracking-[0.2em] hover:bg-navy/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 bg-navy text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-3.5 hover:bg-navy/90 transition-colors disabled:opacity-30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                {/* Quick WhatsApp after save */}
                <button
                  onClick={() => { openWhatsApp({ ...editVisit, status: editStatus, confirmed_date: editConfirmedDate, confirmed_time: editConfirmedTime }); }}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-3.5 hover:bg-green-600 transition-colors cursor-pointer"
                >
                  <Send size={14} /> Send WhatsApp Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ WHATSAPP MESSAGE MODAL ═══ */}
      <AnimatePresence>
        {waVisit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setWaVisit(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md shadow-2xl border-stitch relative"
            >
              <div className="cross-mark top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-navy"></div>

              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-stitch-b flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold mb-1">WhatsApp Message</p>
                  <h3 className="text-xl font-display font-medium text-navy">Send to {waVisit.lead_name}</h3>
                  <p className="text-xs text-navy/40 mt-0.5">+91 {waVisit.lead_phone}</p>
                </div>
                <button onClick={() => setWaVisit(null)} className="w-9 h-9 border border-navy/10 flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-all cursor-pointer">
                  <X size={14} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Template selector */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Template</label>
                  <div className="flex flex-wrap gap-2">
                    {['Pending', 'Confirmed', 'Rescheduled', 'Cancelled'].map(t => {
                      const sc = STATUS_CONFIG[t];
                      return (
                        <button
                          key={t}
                          onClick={() => setWaMessage(getWhatsAppTemplate(waVisit, t))}
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border rounded transition-all cursor-pointer ${sc.color} ${sc.bg} ${sc.border} hover:opacity-80`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message preview */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-navy/40 font-bold block mb-2">Message Preview</label>
                  <textarea
                    value={waMessage}
                    onChange={e => setWaMessage(e.target.value)}
                    rows={8}
                    className="w-full bg-green-50 border border-green-200 text-navy text-sm p-4 focus:border-green-500 focus:outline-none transition-colors font-sans whitespace-pre-wrap"
                  />
                </div>

                {/* Send */}
                <button
                  onClick={sendWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold uppercase text-xs tracking-[0.2em] px-6 py-4 hover:bg-green-600 transition-colors cursor-pointer shadow-[0_4px_16px_rgba(34,197,94,0.3)]"
                >
                  <Send size={14} /> Open WhatsApp & Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
