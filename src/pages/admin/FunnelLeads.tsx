import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, FileText, Filter, Trash2, TrendingUp, MapPin, Calendar, MessageCircle, Phone, StickyNote, BarChart2, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StatusSelector } from '../../components/admin/StatusSelector';
import { DeleteModal } from '../../components/admin/DeleteModal';
import { NotesDrawer } from '../../components/admin/NotesDrawer';

import CanvasJSChart from '../../components/CanvasJSChart';
import { useFunnelLeads } from '../../hooks/useFunnelLeads';

const PIE_COLORS = ['#161B40', '#F7D112', '#3b82f6', '#10b981', '#f59e0b'];

export default function FunnelLeads() {
  const { data: leads = [], isLoading, deleteLead } = useFunnelLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [notesLead, setNotesLead] = useState<any | null>(null);


  const totalLeads = leads.length;

  const avgBudget = leads.length > 0
    ? Math.round(leads.reduce((sum, l) => sum + ((l.budget_min || 0) + (l.budget_max || 0)) / 2, 0) / leads.length)
    : 0;

  const locationCounts: Record<string, number> = {};
  leads.forEach(l => {
    const loc = l.preferred_location || 'Unknown';
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
  });
  const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = leads.filter(l => new Date(l.created_at) >= weekAgo).length;

  const budgetDist: Record<string, number> = {};
  leads.forEach(l => {
    const bt = l.budget_type || 'Unknown';
    budgetDist[bt] = (budgetDist[bt] || 0) + 1;
  });
  const budgetChartData = Object.entries(budgetDist).map(([name, value]) => ({ name, value }));

  const locationPieData = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const utmDist: Record<string, number> = {};
  leads.forEach(l => {
    const u = l.utm_source || 'Direct / None';
    utmDist[u] = (utmDist[u] || 0) + 1;
  });
  const utmPieData = Object.entries(utmDist)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const filteredLeads = leads.filter(l =>
    (statusFilter === 'All' || (l.status || 'new') === statusFilter) &&
    ((l.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (l.preferred_location || '').toLowerCase().includes(search.toLowerCase()) ||
     (l.whatsapp_number || '').includes(search))
  );

  const exportCSV = () => {
    const headers = ['Name', 'WhatsApp', 'Budget', 'Location', 'Pincode', 'Move-in', 'Property Type', 'Furnishing', 'UTM Source', 'Status', 'Date'];
    const csvData = leads.map(l => [
      l.full_name, l.whatsapp_number, `${l.budget_type} (${l.budget_min}-${l.budget_max})`,
      l.preferred_location, l.preferred_pincode, l.move_in_type,
      (l.property_type || []).join('; '), (l.furnishing_type || []).join('; '),
      l.utm_source || '', l.status || 'new', format(new Date(l.created_at), 'PPP')
    ]);
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'funnel_leads.csv');
    link.style.visibility = 'hidden';
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
    doc.text('Quest Housing - Funnel Leads', 14, 20);
    const tableData = leads.map(l => [
      l.full_name, l.whatsapp_number, l.budget_type,
      l.preferred_location, l.move_in_type,
      (l.property_type || []).join(', '),
      l.status || 'new', format(new Date(l.created_at), 'PPP')
    ]);
    autoTable(doc, {
      head: [['Name', 'WhatsApp', 'Budget', 'Location', 'Move-in', 'Property', 'Status', 'Date']],
      body: tableData, startY: 40, styles: { fontSize: 7 },
      headStyles: { fillColor: [22, 27, 64] },
    });
    doc.save('funnel_leads.pdf');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Funnel Leads</h2>
        <p className="text-navy/50 text-sm">Leads captured from the guided property requirement funnel.</p>
      </div>

      {!isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AnalyticsCard icon={<TrendingUp size={18} />} title="Total Funnel Leads" value={totalLeads} />
            <AnalyticsCard icon={<span className="text-lg font-bold">₹</span>} title="Avg Budget" value={`₹${avgBudget.toLocaleString()}`} />
            <AnalyticsCard icon={<MapPin size={18} />} title="Top Location" value={topLocation} />
            <AnalyticsCard icon={<Calendar size={18} />} title="This Week" value={thisWeek} highlight />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <BarChart2 size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Budget Distribution</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  toolTip: { shared: true },
                  axisX: { gridThickness: 0, tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280" },
                  axisY: { gridThickness: 1, gridColor: "#E5E7EB", tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280" },
                  data: [{
                    type: "column",
                    color: "#161B40",
                    dataPoints: budgetChartData.map(d => ({ label: d.name, y: d.value }))
                  }]
                }} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <MapPin size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Top Locations</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  data: [{
                    type: "pie",
                    innerRadius: "70%",
                    showInLegend: true,
                    toolTipContent: "<b>{label}</b>: {y}",
                    dataPoints: locationPieData.map((d, i) => ({ label: d.name, y: d.value, color: PIE_COLORS[i % PIE_COLORS.length] }))
                  }]
                }} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <PieChart size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Traffic Sources (UTM)</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  data: [{
                    type: "pie",
                    innerRadius: "70%",
                    showInLegend: true,
                    toolTipContent: "<b>{label}</b>: {y}",
                    dataPoints: utmPieData.map((d, i) => ({ label: d.name, y: d.value, color: PIE_COLORS[i % PIE_COLORS.length] }))
                  }]
                }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div />
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
            <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy" />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/50" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white border border-navy/10 rounded-lg text-sm focus:outline-none focus:border-navy appearance-none font-medium text-navy cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="new">New</option>
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

      <div className="bg-white rounded-2xl border-stitch shadow-xl h-[70vh] flex flex-col relative stitch-grid overflow-hidden">
        <div className="overflow-auto flex-1 hide-scrollbar pb-32">
          <table className="w-full text-left text-sm bg-white/90 backdrop-blur-md">
            <thead className="bg-navy/5 border-stitch-b text-xs uppercase tracking-widest text-navy/60 font-bold sticky top-0 z-10 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Budget</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Move-in</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {isLoading ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-navy/50">Loading leads...</td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-navy/50">No funnel leads found.</td></tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-navy/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{lead.full_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium mb-2">{lead.whatsapp_number}</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${(lead.whatsapp_number || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.full_name}, this is Quest Housing Bangalore. We received your requirement for ${(lead.property_type || []).join('/')} in ${lead.preferred_location}. Our team is on it! 🏠`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-green-500 hover:bg-green-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <MessageCircle size={12} /> WA
                        </a>
                        <a
                          href={`tel:+91${(lead.whatsapp_number || '').replace(/\D/g, '')}`}
                          title="Call directly"
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-blue-500 hover:bg-blue-600 px-2.5 py-1.5 rounded transition-colors"
                        >
                          <Phone size={12} /> Call
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium">{lead.budget_type || '—'}</p>
                      <p className="text-xs text-navy/50">₹{(lead.budget_min || 0).toLocaleString()} – ₹{(lead.budget_max || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy font-medium">{lead.preferred_location || '—'}</p>
                      <p className="text-xs text-navy/50">{lead.preferred_pincode || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {lead.move_in_type || '—'}
                      {lead.move_in_date && <p className="text-xs text-navy/50">{format(new Date(lead.move_in_date), 'MMM dd, yyyy')}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(lead.property_type || []).map((t: string, i: number) => (
                          <span key={i} className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded font-medium">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {lead.utm_source ? (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-bold uppercase tracking-widest border border-primary/20">
                          {lead.utm_source}
                        </span>
                      ) : (
                        <span className="text-[10px] text-navy/40 font-bold uppercase tracking-widest">
                          Direct
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-navy/70 text-sm">
                      {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusSelector currentStatus={lead.status || 'new'} leadId={lead.id} table="instagram_leads" />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => setNotesLead(lead)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-navy bg-navy/5 hover:bg-navy/10 px-3 py-1.5 rounded transition-colors">
                        <StickyNote size={14} /> Notes
                      </button>
                      <button onClick={() => setLeadToDelete(lead.id)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition-colors">
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
      <NotesDrawer isOpen={!!notesLead} onClose={() => setNotesLead(null)} lead={notesLead} table="instagram_leads" />
      <DeleteModal isOpen={!!leadToDelete} onClose={() => setLeadToDelete(null)} onConfirm={() => { if (leadToDelete) { deleteLead.mutate(leadToDelete); setLeadToDelete(null); } }} />
    </motion.div>
  );
}

function AnalyticsCard({ icon, title, value, highlight = false }: { icon: React.ReactNode; title: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${highlight ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy/5'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${highlight ? 'bg-white/10 text-primary' : 'bg-navy/5 text-navy'}`}>
        {icon}
      </div>
      <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${highlight ? 'text-white/50' : 'text-navy/50'}`}>{title}</p>
      <p className="text-3xl font-display font-medium">{value}</p>
    </div>
  );
}
