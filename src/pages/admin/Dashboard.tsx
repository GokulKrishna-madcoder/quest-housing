import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Users, Home, TrendingUp, CheckCircle, Clock, PhoneCall, Timer, Activity, Zap, BarChart2, PieChart } from 'lucide-react';
import CanvasJSReact from '@canvasjs/react-charts';
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

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
  const barData = [
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
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <BarChart2 size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Status Breakdown</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  toolTip: { shared: true },
                  axisX: { gridThickness: 0, tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280" },
                  axisY: { gridThickness: 1, gridColor: "#E5E7EB", tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280" },
                  data: [
                    { type: "column", name: "Owners", showInLegend: true, color: "#161B40", dataPoints: barData.map(d => ({ label: d.name, y: d.Owners })) },
                    { type: "column", name: "Funnel", showInLegend: true, color: "#F7D112", dataPoints: barData.map(d => ({ label: d.name, y: d.Funnel })) }
                  ]
                }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <PieChart size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Overall Pipeline Health</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  data: [{
                    type: "pie",
                    showInLegend: true,
                    innerRadius: "70%",
                    toolTipContent: "<b>{label}</b>: {y}",
                    dataPoints: pieData.map(d => ({ label: d.name, y: d.value, color: d.color }))
                  }]
                }} />
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
              value={visitConversionRate}
              icon={<Activity size={20} />}
              trend={`${conversion.visits_requested} visits from ${conversion.total_leads} leads`}
            />
            <StatCard
              title="WhatsApp Engagement"
              value={whatsappRate}
              icon={<Zap size={20} />}
              trend={`${conversion.whatsapp_opened} WhatsApp opens`}
            />
          </div>

          {/* Lead Velocity Chart */}
          {rpcData.leadVelocity.length > 0 && (
            <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col">
              <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Lead Velocity (Last 30 Days)</h3>
              </div>
              <div className="p-5 md:p-6 lg:p-8 flex-1">
                <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
                <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                  animationEnabled: true,
                  axisX: { gridThickness: 0, tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280" },
                  axisY: { gridThickness: 1, gridColor: "#E5E7EB", tickLength: 0, lineThickness: 0, labelFontColor: "#6B7280", includeZero: true },
                  toolTip: { shared: true },
                  data: [{
                    type: "area",
                    color: "#161B40",
                    fillOpacity: 0.1,
                    dataPoints: rpcData.leadVelocity.map(d => ({ x: new Date(d.day), y: d.count }))
                  }]
                }} />
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

          <div className="bg-white rounded-2xl border-stitch shadow-md relative stitch-grid flex flex-col max-w-2xl">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <Home size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Property Types</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1">
              <div className="h-[300px] md:h-[350px] lg:h-[400px] w-full">
              <CanvasJSChart containerProps={{ width: '100%', height: '100%' }} options={{
                animationEnabled: true,
                data: [{
                  type: "pie",
                  showInLegend: true,
                  toolTipContent: "<b>{label}</b>: {y}",
                  dataPoints: propTypesData.map((d, i) => ({ label: d.name, y: d.value, color: COLORS[i % COLORS.length] }))
                }]
              }} />
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
    <div className={`p-8 rounded-2xl border flex flex-col justify-between ${highlight ? 'bg-navy text-white border-navy shadow-xl' : 'bg-white text-navy border-navy/5 shadow-sm'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${highlight ? 'bg-white/10 text-primary' : 'bg-navy/5 text-navy'}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-display font-medium mb-1">{value}</p>
        <h3 className={`text-xs font-bold uppercase tracking-[0.1em] mb-2 ${highlight ? 'text-white/70' : 'text-navy/50'}`}>{title}</h3>
        <p className={`text-xs ${highlight ? 'text-primary' : 'text-green-600'}`}>{trend}</p>
      </div>
    </div>
  );
}

function PipelineCard({ title, owners, funnel, icon, color, bg, border }: any) {
  return (
    <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-sm ${bg} ${border}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={color}>{icon}</div>
        <h4 className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title}</h4>
      </div>
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[10px] text-navy/60 uppercase tracking-widest font-bold mb-1">Owners</p>
           <p className={`text-2xl font-display font-medium text-navy`}>{owners}</p>
        </div>
        <div className="w-[1px] h-10 bg-navy/10 mx-2"></div>
        <div>
           <p className="text-[10px] text-navy/60 uppercase tracking-widest font-bold mb-1">Funnel</p>
           <p className={`text-2xl font-display font-medium text-navy`}>{funnel}</p>
        </div>
      </div>
    </div>
  );
}
