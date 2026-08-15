import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Eye, Users, Calendar, MessageCircle, TrendingUp, Globe, FileText, Building2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler);

type DateRange = '7d' | '30d' | 'all';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  
  // Data state
  const [stats, setStats] = useState({ views: 0, sessions: 0, schedules: 0, whatsapp: 0 });
  const [chartData, setChartData] = useState<any>(null);
  const [topPages, setTopPages] = useState<{path: string, views: number, percent: number}[]>([]);
  const [locationData, setLocationData] = useState<any>(null);
  const [topProperties, setTopProperties] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Calculate start date
      let startDate = new Date();
      if (dateRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (dateRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else startDate = new Date(0); // all time
      
      // Fetch events
      const { data: events } = await supabase
        .from('user_events')
        .select('event_name, event_data, session_id, created_at')
        .gte('created_at', startDate.toISOString());
        
      if (!events) {
        setLoading(false);
        return;
      }
      
      // Fetch properties for join
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title');
        
      const propMap = new Map(properties?.map(p => [p.id, p.title]) || []);

      // Aggregate
      const pageViews = events.filter(e => e.event_name === 'page_view');
      const uniqueSessions = new Set(events.map(e => e.session_id)).size;
      const schedules = events.filter(e => e.event_name === 'visit_requested').length;
      const whatsapp = events.filter(e => e.event_name === 'whatsapp_opened').length;
      
      setStats({ views: pageViews.length, sessions: uniqueSessions, schedules, whatsapp });

      // Chart Data (Group by day)
      const byDay = pageViews.reduce((acc, e) => {
        const date = new Date(e.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setChartData({
        labels: Object.keys(byDay),
        datasets: [{
          label: 'Page Views',
          data: Object.values(byDay),
          borderColor: 'rgba(204, 163, 84, 1)',
          backgroundColor: 'rgba(204, 163, 84, 0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
        }]
      });

      // Top Pages
      const byPath = pageViews.reduce((acc, e) => {
        const path = e.event_data?.path || '/';
        acc[path] = (acc[path] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const totalViews = pageViews.length || 1;
      const topPagesArr = Object.entries(byPath)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([path, views]) => ({ path, views, percent: Math.round((views / totalViews) * 100) }));
      setTopPages(topPagesArr);

      // Top Locations
      const byCountry = events.reduce((acc, e) => {
        const country = e.event_data?.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topLocations = Object.entries(byCountry)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
        
      setLocationData({
        labels: topLocations.map(l => l[0]),
        datasets: [{
          label: 'Events',
          data: topLocations.map(l => l[1]),
          backgroundColor: 'rgba(204, 163, 84, 0.8)',
          borderRadius: 4
        }]
      });

      // Top Properties
      const propertyViews = events.filter(e => e.event_name === 'property_view');
      const visitRequests = events.filter(e => e.event_name === 'visit_requested');
      
      const byProperty = propertyViews.reduce((acc, e) => {
        const id = e.event_data?.property_id;
        if (id) acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const requestsByProperty = visitRequests.reduce((acc, e) => {
        const id = e.event_data?.property_id;
        if (id) acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPropsArr = Object.entries(byProperty)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, views]) => ({
          id,
          title: propMap.get(id) || 'Unknown Property',
          views,
          schedules: requestsByProperty[id] || 0
        }));
        
      setTopProperties(topPropsArr);
      setLoading(false);
    }
    
    fetchData();
  }, [dateRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(26, 35, 53, 0.06)' }, beginAtZero: true }
    }
  };

  const barOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(26, 35, 53, 0.06)' }, beginAtZero: true },
      y: { grid: { display: false } }
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-navy tracking-tight">Analytics</h1>
        <div className="flex bg-white rounded-lg border border-navy/10 p-1 shadow-sm">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${dateRange === range ? 'bg-primary/10 text-primary' : 'text-navy/60 hover:text-navy hover:bg-navy/5'}`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><Eye size={18} className="text-primary" /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Total Page Views</p>
              </div>
              <p className="text-3xl font-display font-medium text-navy">{stats.views.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><Users size={18} className="text-primary" /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Unique Sessions</p>
              </div>
              <p className="text-3xl font-display font-medium text-navy">{stats.sessions.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><Calendar size={18} className="text-primary" /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Schedule Visits</p>
              </div>
              <p className="text-3xl font-display font-medium text-navy">{stats.schedules.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl"><MessageCircle size={18} className="text-primary" /></div>
                <p className="text-xs font-bold uppercase tracking-widest text-navy/50">WhatsApp Clicks</p>
              </div>
              <p className="text-3xl font-display font-medium text-navy">{stats.whatsapp.toLocaleString()}</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Traffic Over Time</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1 h-[300px]">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all overflow-hidden">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <FileText size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Top Pages</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-navy/10">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Page Path</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Views</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">% of Total</th>
                  </tr></thead>
                  <tbody>
                    {topPages.map((page, i) => (
                      <tr key={i} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                        <td className="py-3 px-4 text-navy/80 font-mono text-xs">{page.path}</td>
                        <td className="py-3 px-4 text-navy/80 text-right">{page.views.toLocaleString()}</td>
                        <td className="py-3 px-4 text-navy/80 text-right">{page.percent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <Globe size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Top Locations</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1 h-[300px]">
                {locationData && <Bar data={locationData} options={barOptions} />}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all overflow-hidden">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <Building2 size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Most Viewed Properties</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-navy/10">
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Property Title</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Views</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Schedule Clicks</th>
                </tr></thead>
                <tbody>
                  {topProperties.map((prop, i) => (
                    <tr key={i} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                      <td className="py-3 px-4 text-navy/80 font-medium">{prop.title}</td>
                      <td className="py-3 px-4 text-navy/80 text-right">{prop.views.toLocaleString()}</td>
                      <td className="py-3 px-4 text-navy/80 text-right">{prop.schedules.toLocaleString()}</td>
                    </tr>
                  ))}
                  {topProperties.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-navy/50">No property views found for this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
