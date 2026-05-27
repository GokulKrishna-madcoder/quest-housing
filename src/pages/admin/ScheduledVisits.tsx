import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Download, FileText, Filter, Trash2, MessageCircle, Phone } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../lib/supabase';
import { StatusSelector } from '../../components/admin/StatusSelector';
import { DeleteModal } from '../../components/admin/DeleteModal';

export default function ScheduledVisits() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);

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
  }, []);

  const filteredVisits = visits.filter(v =>
    (statusFilter === 'All' || (v.status || 'Pending') === statusFilter) &&
    ((v.lead_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (v.lead_phone || '').includes(search))
  );

  const exportCSV = () => {
    const headers = ['Lead Name', 'Phone', 'Preferred Dates', 'Preferred Time', 'Property', 'Status', 'Created At'];
    const rows = visits.map(v => [
      v.lead_name,
      v.lead_phone,
      [v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map(d => format(new Date(d), 'yyyy-MM-dd')).join(' | '),
      v.preferred_time || '-',
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
      [v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map(d => format(new Date(d), 'yyyy-MM-dd')).join(' | '),
      v.preferred_time || '-',
      v.property?.title || v.property?.id,
      v.status || 'Pending',
      format(new Date(v.created_at), 'PPP')
    ]);
    autoTable(doc, {
      head: [['Lead', 'Phone', 'Preferred Dates', 'Time', 'Property', 'Status', 'Created']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 27, 64] },
    });
    doc.save('scheduled_visits.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Scheduled Visits</h2>
          <p className="text-navy/50 text-sm">Manage visit requests from tenants, linked to property details.</p>
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
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-navy/90 transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-primary text-navy px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors">
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border-stitch shadow-xl h-[70vh] flex flex-col relative stitch-grid overflow-hidden">
        <div className="overflow-auto flex-1 hide-scrollbar pb-32">
          <table className="w-full text-left text-sm bg-white/90 backdrop-blur-md">
            <thead className="bg-navy/5 border-stitch-b text-xs uppercase tracking-widest text-navy/60 font-bold sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Preferred Dates</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-navy/50">Loading visits...</td></tr>
              ) : filteredVisits.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-navy/50">No visits found.</td></tr>
              ) : (
                filteredVisits.map(v => (
                  <tr key={v.id} className="hover:bg-navy/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{v.lead_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium mb-2">{v.lead_phone}</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${(v.lead_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.lead_name}, this is Quest Housing. We received your visit request for the property ${v.property?.title || ''}. Let us know a convenient time!`)} `}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <MessageCircle size={12} /> WA
                        </a>
                        <a
                          href={`tel:+91${(v.lead_phone || '').replace(/\D/g, '')}`}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <Phone size={12} /> Call
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {[v.preferred_date_1, v.preferred_date_2, v.preferred_date_3].filter(Boolean).map(d => format(new Date(d), 'MMM dd')).join(' | ')}
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">{v.preferred_time || '-'}</td>
                    <td className="px-6 py-4">
                      <a
                        href={`/properties/${v.property?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80"
                      >
                        {v.property?.title || v.property?.id}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelector currentStatus={v.status || 'Pending'} leadId={v.id} table="visit_slots" />
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">{format(new Date(v.created_at), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => setVisitToDelete(v.id)} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors">
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal isOpen={!!visitToDelete} onClose={() => setVisitToDelete(null)} onConfirm={() => {
        if (visitToDelete) {
          supabase.from('visit_slots').delete().eq('id', visitToDelete).then(() => {
            setVisits(prev => prev.filter(v => v.id !== visitToDelete));
          });
          setVisitToDelete(null);
        }
      }} />
    </motion.div>
  );
}
