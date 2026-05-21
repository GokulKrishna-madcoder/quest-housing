import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, Image as ImageIcon, X, FileText, Trash2, Filter } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatusSelector } from '../../components/admin/StatusSelector';
import { DeleteModal } from '../../components/admin/DeleteModal';
import { toast } from 'sonner';

export default function OwnerLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();

    // Subscribe to realtime updates
    const channel = supabase.channel('public:owner_leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_leads' }, (payload) => {
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
      .from('owner_leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setLeads(data);
    setLoading(false);
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('owner_leads').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete lead: ' + error.message);
    } else {
      toast.success('Lead deleted successfully.');
    }
  };

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Phone', 'WhatsApp', 'Property Type', 'Location', 'Status', 'Date Submitted'];
    const csvData = leads.map(l => [
      l.full_name, l.email, l.phone, l.whatsapp || '-', l.property_type, l.location, l.status || 'Pending', format(new Date(l.created_at), 'PPP')
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'owner_leads.csv');
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
    doc.text('Quest Housing - Owner Leads', 14, 20);
    
    const tableData = leads.map(l => [
      l.full_name,
      l.email,
      l.phone,
      l.property_type,
      l.location,
      l.status || 'Pending',
      format(new Date(l.created_at), 'PPP')
    ]);

    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Property', 'Location', 'Status', 'Date']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 27, 64] },
    });

    doc.save('owner_leads.pdf');
  };

  const filteredLeads = leads.filter(l => 
    (statusFilter === 'All' || (l.status || 'Pending') === statusFilter) &&
    (l.full_name.toLowerCase().includes(search.toLowerCase()) || 
    l.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Owner Leads</h2>
          <p className="text-navy/50 text-sm">Manage property owner submissions in real-time.</p>
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
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Property details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">Loading leads...</td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-navy/50">No leads found.</td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-navy/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{lead.full_name}</p>
                      <p className="text-xs text-navy/50">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy">{lead.phone}</p>
                      {lead.whatsapp && <p className="text-xs text-green-600">WA: {lead.whatsapp}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy">{lead.property_type}</p>
                      <p className="text-xs text-navy/50">{lead.location}</p>
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelector currentStatus={lead.status} leadId={lead.id} table="owner_leads" />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                         onClick={() => setSelectedLead(lead)}
                         className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-navy px-3 py-1.5 rounded hover:bg-navy-dark transition-colors"
                      >
                         <ImageIcon size={14} /> View
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

      <AnimatePresence>
        {selectedLead && (
          <ImageModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
        )}
      </AnimatePresence>
      <DeleteModal 
        isOpen={!!leadToDelete} 
        onClose={() => setLeadToDelete(null)} 
        onConfirm={() => leadToDelete && handleDelete(leadToDelete)} 
      />
    </motion.div>
  );
}

function ImageModal({ lead, onClose }: { lead: any, onClose: () => void }) {
  const images = lead.image_urls || [];
  
  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${lead.full_name.replace(/\s+/g, '-').toLowerCase()}-property-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-navy/90 backdrop-blur-sm cursor-pointer z-0" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 bg-white w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-full"
      >
        <div className="px-8 py-6 border-b border-navy/10 flex justify-between items-center bg-light">
          <div>
            <h3 className="text-2xl font-display font-medium uppercase tracking-tight text-navy">{lead.full_name}'s Property</h3>
            <p className="text-xs text-navy/60 uppercase tracking-widest mt-1">{lead.property_type} in {lead.location}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-navy/10 rounded-full transition-colors">
            <X size={24} className="text-navy" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8 p-6 bg-navy/5 rounded-xl">
             <h4 className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-2">Description</h4>
             <p className="text-navy font-sans text-sm">{lead.description || 'No description provided.'}</p>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-4">Property Images</h4>
          
          {images.length === 0 ? (
            <div className="text-center py-20 bg-navy/5 rounded-xl border border-navy/10 border-dashed">
              <ImageIcon size={48} className="mx-auto text-navy/20 mb-4" />
              <p className="text-navy/50 text-sm">No images uploaded for this property.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((url: string, index: number) => (
                <div key={index} className="group relative aspect-video bg-navy/10 rounded-lg overflow-hidden">
                  <img src={url} alt="Property" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <button onClick={() => handleDownload(url, index)} className="bg-white text-navy px-4 py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors flex items-center gap-2">
                       <Download size={14} /> Download
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
