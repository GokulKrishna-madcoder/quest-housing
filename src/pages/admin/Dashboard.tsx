import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Users, Home, TrendingUp, CheckCircle, Clock, PhoneCall, Timer, Activity, Zap, BarChart2, PieChart } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler, ArcElement);

export default function AdminDashboard() {
  const [data, setData] = useState({
    owners: [],
    funnel: [],
    properties: [],
  });

  const [rpcData, setRpcData] = useState({
    avgResponseTime: 0,
    leadVelocity: [] as any[],
    visitConversion: { total_leads: 0, visits_requested: 0, whatsapp_opened: 0 } as any,
  });

  const [loading, setLoading] = useState(true);

  const fetchRpcData = async () => {
    const [respTimeRes, velocityRes, conversionRes] = await Promise.all([
      supabase.rpc('get_avg_response_time'),
      supabase.rpc('get_lead_velocity'),
      supabase.rpc('get_visit_conversion_rate'),
    ]);
    setRpcData({
      avgResponseTime: respTimeRes.data || 0,
      leadVelocity: velocityRes.data || [],
      visitConversion: conversionRes.data || { total_leads: 0, visits_requested: 0, whatsapp_opened: 0 },
    });
  };

  const fetchData = async () => {
    const [ownersRes, funnelRes, propsRes] = await Promise.all([
      supabase.from('owner_leads').select('status, created_at, id'),
      supabase.from('instagram_leads').select('status, created_at, id'),
      supabase.from('properties').select('id, type, admin_status, created_at')
    ]);

    setData({
      owners: ownersRes.data || [],
      funnel: funnelRes.data || [],
      properties: propsRes.data || []
    });
    await fetchRpcData();
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Re-fetch data on any table changes to keep analytics 100% real-time
    const channelOwners = supabase.channel('dashboard_owners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'owner_leads' }, () => {
        fetchData();
      }).subscribe();

    const channelFunnel = supabase.channel('dashboard_funnel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'instagram_leads' }, () => {
        fetchData();
      }).subscribe();

    const channelProps = supabase.channel('dashboard_props')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchData();
      }).subscribe();

    return () => {
      supabase.removeChannel(channelOwners);
      supabase.removeChannel(channelFunnel);
      supabase.removeChannel(channelProps);
    };
  }, []);

  const getStats = (items: any[]) => {
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'Pending' || !i.status).length,
      contacted: items.filter(i => i.status === 'Contacted').length,
      completed: items.filter(i => i.status === 'Completed').length,
    };
  };

  const ownerStats = getStats(data.owners);
  const funnelStats = getStats(data.funnel);

  const getRecentTotal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filterToday = (i: any) => new Date(i.created_at) >= today;
    return data.owners.filter(filterToday).length + data.funnel.filter(filterToday).length;
  };

  const pieData = [
    { name: 'Pending', value: ownerStats.pending + funnelStats.pending, color: '#f59e0b' },
    { name: 'Contacted', value: ownerStats.contacted + funnelStats.contacted, color: '#3b82f6' },
    { name: 'Completed', value: ownerStats.completed + funnelStats.completed, color: '#10b981' },
  ];

  // Group data by status for bar chart
  const barDataRaw = [
    { name: 'Pending', Owners: ownerStats.pending, Funnel: funnelStats.pending },
    { name: 'Contacted', Owners: ownerStats.contacted, Funnel: funnelStats.contacted },
    { name: 'Completed', Owners: ownerStats.completed, Funnel: funnelStats.completed },
  ];

  // Phase 4: CRO Analytics
  const conversion = rpcData.visitConversion;
  const visitConversionRate = conversion.total_leads > 0
    ? ((conversion.visits_requested / conversion.total_leads) * 100).toFixed(1)
    : '0.0';
  const whatsappRate = conversion.total_leads > 0
    ? ((conversion.whatsapp_opened / conversion.total_leads) * 100).toFixed(1)
    : '0.0';

  // Property Analytics calculations
  const totalProps = data.properties.length;
  const availableProps = data.properties.filter((p: any) => p.admin_status === 'approved').length;
  const rentedProps = data.properties.filter((p: any) => p.admin_status === 'rejected').length;

  // Group properties by type
  const propTypesMap = data.properties.reduce((acc: any, curr: any) => {
    const t = curr.type || 'Other';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  
  const propTypesData = Object.keys(propTypesMap).map(key => ({
    name: key,
    value: propTypesMap[key]
  }));

  const COLORS = ['#161B40', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { usePointStyle: true, boxWidth: 6, padding: 20, font: { family: 'Inter', size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0a0f1c',
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true
      }
    }
  };

  const lineChartData = {
    labels: barDataRaw.map(d => d.name),
    datasets: [
      {
        label: 'Owners',
        data: barDataRaw.map(d => d.Owners),
        borderColor: '#161B40',
        backgroundColor: '#161B40',
        tension: 0.4,
        pointHoverRadius: 6,
        borderWidth: 2
      },
      {
        label: 'Funnel',
        data: barDataRaw.map(d => d.Funnel),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.4,
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  const lineChartOptions = {
    ...chartDefaults,
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { color: '#e2e8f0' }, border: { display: false }, beginAtZero: true }
    }
  };

  const doughnutChartData = {
    labels: pieData.map(d => d.name),
    datasets: [{
      data: pieData.map(d => d.value),
      backgroundColor: pieData.map(d => d.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const doughnutChartOptions = {
    ...chartDefaults,
    cutout: '75%',
    plugins: {
      ...chartDefaults.plugins,
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20, font: { family: 'Inter', size: 11 } } }
    }
  };

  const safeLeadVelocity = Array.isArray(rpcData.leadVelocity) ? rpcData.leadVelocity : [];

  const velocityChartData = {
    labels: safeLeadVelocity.map(d => new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      fill: false,
      label: 'New Leads',
      data: safeLeadVelocity.map(d => d.count),
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2
    }]
  };

  const velocityChartOptions = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: { ...chartDefaults.plugins.tooltip, mode: 'index' as const, intersect: false }
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { maxTicksLimit: 7 } },
      y: { grid: { color: '#e2e8f0' }, border: { display: false }, beginAtZero: true }
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false }
  };

  const propChartData = {
    labels: propTypesData.map(d => d.name),
    datasets: [{
      data: propTypesData.map(d => d.value),
      backgroundColor: propTypesData.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div>
        <h2 className="text-3xl font-display font-medium uppercase tracking-tighter mb-2">Command Center</h2>
        <p className="text-navy/50 text-sm">Real-time overview of Quest Housing lead conversions and status.</p>
      </div>

      {loading ? (
         <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
         </div>
      ) : (
        <>
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Owner Leads" 
              value={ownerStats.total} 
              icon={<Home size={20} />}
              trend="Across all statuses"
            />
            <StatCard 
              title="Total Funnel Leads" 
              value={funnelStats.total} 
              icon={<Users size={20} />}
              trend="Across all statuses"
            />
            <StatCard 
              title="New Leads Today" 
              value={getRecentTotal()} 
              icon={<TrendingUp size={20} />}
              trend="Updating real-time"
              highlight
            />
          </div>

          <h3 className="text-lg font-display font-medium uppercase tracking-widest text-navy pt-4">Status Pipeline</h3>
          
          {/* Pipeline Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            <PipelineCard title="Pending Review" owners={ownerStats.pending} funnel={funnelStats.pending} icon={<Clock size={16} />} color="text-amber-600" bg="bg-amber-50" border="border-amber-100" />
            <PipelineCard title="Contacted" owners={ownerStats.contacted} funnel={funnelStats.contacted} icon={<PhoneCall size={16} />} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
            <PipelineCard title="Completed" owners={ownerStats.completed} funnel={funnelStats.completed} icon={<CheckCircle size={16} />} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-100" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col hover:shadow-lg transition-all">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Status Breakdown</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col hover:shadow-lg transition-all">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <PieChart size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Overall Pipeline Health</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-3xl font-display font-medium text-navy">{getRecentTotal()}</p>
                      <p className="text-[10px] uppercase tracking-widest text-navy/50 font-bold">New Today</p>
                    </div>
                  </div>
                  <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4: CRO Analytics Widgets */}
          <h3 className="text-lg font-display font-medium uppercase tracking-widest text-navy pt-8">CRO Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Avg Response Time"
              value={Math.round(rpcData.avgResponseTime)}
              icon={<Timer size={20} />}
              trend="Hours from lead → first contact"
            />
            <StatCard
              title="Visit Conversion"
              value={visitConversionRate + '%'}
              icon={<Activity size={20} />}
              trend={`${conversion.visits_requested} visits from ${conversion.total_leads} leads`}
            />
            <StatCard
              title="WhatsApp Engagement"
              value={whatsappRate + '%'}
              icon={<Zap size={20} />}
              trend={`${conversion.whatsapp_opened} WhatsApp opens`}
            />
          </div>

          {/* Lead Velocity Chart */}
          {safeLeadVelocity.length > 0 && (
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col hover:shadow-lg transition-all">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Lead Velocity (Last 30 Days)</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                  <Line data={velocityChartData} options={velocityChartOptions} />
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-display font-medium uppercase tracking-widest text-navy pt-8">Property Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Properties" 
              value={totalProps} 
              icon={<Home size={20} />}
              trend="Inventory"
            />
            <StatCard 
              title="Available" 
              value={availableProps} 
              icon={<CheckCircle size={20} />}
              trend="Ready to rent"
            />
            <StatCard 
              title="Rented" 
              value={rentedProps} 
              icon={<Users size={20} />}
              trend="Occupied"
            />
          </div>

          <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col max-w-2xl hover:shadow-lg transition-all">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <Home size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Property Types</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1">
              <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <Pie data={propChartData} options={{...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { position: 'right' as const, labels: { usePointStyle: true, padding: 20 } } }}} />
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, highlight = false }: { title: string, value: number | string, icon: ReactNode, trend: string, highlight?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl border flex flex-col justify-between transition-all hover:-translate-y-1 ${highlight ? 'bg-navy text-white border-navy shadow-xl shadow-navy/20' : 'bg-white text-navy border-navy/5 shadow-sm hover:shadow-md stitch-grid'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${highlight ? 'bg-white/10 text-primary' : 'bg-navy/5 text-navy'}`}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-4xl font-display font-medium mb-1">{value}</p>
        <h3 className={`text-xs font-bold uppercase tracking-[0.1em] mb-2 ${highlight ? 'text-white/70' : 'text-navy/50'}`}>{title}</h3>
        <p className={`text-xs font-medium ${highlight ? 'text-primary' : 'text-emerald-600'}`}>{trend}</p>
      </div>
    </div>
  );
}

function PipelineCard({ title, owners, funnel, icon, color, bg, border }: any) {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-sm transition-all hover:shadow-md stitch-grid hover:-translate-y-1 ${bg} ${border}`}>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className={color}>{icon}</div>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title}</h4>
      </div>
      <div className="flex justify-between items-end relative z-10">
        <div>
           <p className={`text-[10px] ${color} opacity-60 uppercase tracking-widest font-bold mb-1`}>Owners</p>
           <p className={`text-2xl font-display font-medium ${color}`}>{owners}</p>
        </div>
        <div className={`w-[1px] h-10 ${color} opacity-20 mx-2`}></div>
        <div>
           <p className={`text-[10px] ${color} opacity-60 uppercase tracking-widest font-bold mb-1`}>Funnel</p>
           <p className={`text-2xl font-display font-medium ${color}`}>{funnel}</p>
        </div>
      </div>
    </div>
  );
}
