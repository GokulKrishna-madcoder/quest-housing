import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, FileText, Filter, Trash2, MessageCircle, Phone, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatusSelector } from '../../components/admin/StatusSelector';
import { DeleteModal } from '../../components/admin/DeleteModal';
import { NotesDrawer } from '../../components/admin/NotesDrawer';
import { toast } from 'sonner';

export default function TenantLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [notesLead, setNotesLead] = useState<any | null>(null);

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime updates
    const channel = supabase.channel('public:tenant_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tenant_leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads((current) => [payload.new, ...current]);
        } else if (payload.eventType === 'UPDATE') {
          setLeads((current) => current.map(lead => lead.id === payload.new.id ? payload.new : lead));
        } else if (payload.eventType === 'DELETE') {
          setLeads((current) => current.filter(lead => lead.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('tenant_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLeads(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('tenant_leads').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete lead: ' + error.message);
    } else {
      toast.success('Lead deleted successfully.');
    }
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'WhatsApp', 'Looking For', 'Preferred Location', 'Preferences', 'Status', 'Date Submitted'];
    const csvData = leads.map(l => [
      l.full_name, l.email, l.phone, l.whatsapp || '-', l.looking_for, l.preferred_location, `"${(l.preferences || '').replace(/"/g, '""')}"`, l.status || 'Pending', format(new Date(l.created_at), 'PPP')
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'tenant_leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(22, 27, 64); // Navy
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Quest Housing - Tenant Leads', 14, 20);
    
    const tableData = leads.map(l => [
      l.full_name,
      l.email,
      l.phone,
      l.looking_for,
      l.preferred_location,
      l.status || 'Pending',
      format(new Date(l.created_at), 'PPP')
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Intent', 'Location', 'Status', 'Date']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 27, 64] },
    });

    doc.save('tenant_leads.pdf');
  };

  const filteredLeads = leads.filter(l => 
    (statusFilter === 'All' || (l.status || 'Pending') === statusFilter) &&
    (l.full_name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.preferred_location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Tenant Leads</h2>
          <p className="text-navy/50 text-sm">Manage prospective tenant submissions in real-time.</p>
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
              <option value="Contacted">Contacted</option>
              <option value="Completed">Completed</option>
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

      <div className="bg-white rounded-2xl border-stitch shadow-xl h-[100vh] flex flex-col relative stitch-grid overflow-hidden">
        <div className="overflow-auto flex-1 hide-scrollbar pb-32">
          <table className="w-full text-left text-sm bg-white/90 backdrop-blur-md">
            <thead className="bg-navy/5 border-stitch-b text-xs uppercase tracking-widest text-navy/60 font-bold sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Requirements</th>
                <th className="px-6 py-4">Preferences</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-navy/50">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-navy/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{lead.full_name}</p>
                      <p className="text-xs text-navy/50">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium mb-2">{lead.phone}</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${(lead.whatsapp || lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.full_name}, this is Quest Housing Bangalore. We received your enquiry for ${lead.looking_for} in ${lead.preferred_location}. Let us help you find the perfect home! 🏠`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <MessageCircle size={12} /> WA
                        </a>
                        <a
                          href={`tel:+91${(lead.phone || '').replace(/\D/g, '')}`}
                          title="Call directly"
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <Phone size={12} /> Call
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium">{lead.looking_for}</p>
                      <p className="text-xs text-navy/50">Loc: {lead.preferred_location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-navy/70 line-clamp-2 max-w-[200px]" title={lead.preferences}>
                        {lead.preferences || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelector currentStatus={lead.status} leadId={lead.id} table="tenant_leads" />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                         onClick={() => setNotesLead(lead)}
                         className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-navy bg-navy/5 hover:bg-navy/10 px-3 py-1.5 rounded transition-colors"
                      >
                         <StickyNote size={14} /> Notes
                      </button>
                      <button 
                         onClick={() => setLeadToDelete(lead.id)}
                         className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors"
                      >
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
      <NotesDrawer isOpen={!!notesLead} onClose={() => setNotesLead(null)} lead={notesLead} table="tenant_leads" />
      <DeleteModal 
        isOpen={!!leadToDelete} 
        onClose={() => setLeadToDelete(null)} 
        onConfirm={() => leadToDelete && handleDelete(leadToDelete)} 
      />
    </motion.div>
  );
}
