import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { BarChart, AlertTriangle, CheckCircle, Search, Lightbulb } from 'lucide-react';

export default function SEOManager() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase.from('properties').select('id, title, locality, description, images, amenities');
      if (!error && data) {
        const analyzed = data.map((p) => {
          let score = 0;
          const issues = [];
          
          if (p.title && p.title.length >= 10 && p.title.length <= 60) {
            score += 25;
          } else {
            issues.push('Title length');
          }
          
          if (p.description && p.description.length >= 100 && p.description.length <= 300) {
            score += 25;
          } else {
            issues.push('Description length');
          }
          
          if (p.images && p.images.length >= 3) {
            score += 25;
          } else {
            issues.push('Needs 3+ images');
          }
          
          if (p.amenities && p.amenities.length >= 3) {
            score += 25;
          } else {
            issues.push('Needs 3+ amenities');
          }
          
          return { ...p, seoScore: score, issues };
        });
        setProperties(analyzed);
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const total = properties.length;
  const avgScore = total ? Math.round(properties.reduce((acc, p) => acc + p.seoScore, 0) / total) : 0;
  const needsAttention = properties.filter(p => p.seoScore < 50).length;
  const fullyOptimized = properties.filter(p => p.seoScore >= 80).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-navy tracking-tight">SEO Center</h1>
        <p className="text-sm text-navy/50 mt-1">Monitor and optimize your property listings for search engines & AI agents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><BarChart size={18} className="text-primary" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Total Properties</p>
          </div>
          <p className="text-3xl font-display font-medium text-navy">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><Search size={18} className="text-primary" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Avg SEO Score</p>
          </div>
          <p className="text-3xl font-display font-medium text-navy">{avgScore}</p>
        </div>
        <div className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><AlertTriangle size={18} className="text-primary" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Needs Attention</p>
          </div>
          <p className="text-3xl font-display font-medium text-navy">{needsAttention}</p>
        </div>
        <div className="bg-white rounded-2xl border-stitch shadow-md p-6 stitch-grid hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl"><CheckCircle size={18} className="text-primary" /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy/50">Fully Optimized</p>
          </div>
          <p className="text-3xl font-display font-medium text-navy">{fullyOptimized}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <Search size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">SEO Health Overview</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Property Title</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Locality</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">SEO Score</th>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-navy/50">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id} className="border-b border-navy/5 hover:bg-navy/[0.02] transition-colors">
                      <td className="py-3 px-4 text-navy/80">{p.title || 'Untitled'}</td>
                      <td className="py-3 px-4 text-navy/80">{p.locality || '-'}</td>
                      <td className="py-3 px-4 text-navy/80">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.seoScore >= 80 ? 'bg-emerald-100 text-emerald-700' : p.seoScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {p.seoScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-navy/80">{p.issues.join(', ') || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border-stitch shadow-md stitch-grid flex flex-col hover:shadow-lg transition-all">
            <div className="bg-navy/5 border-stitch-b px-5 md:px-6 lg:px-8 py-4 flex items-center gap-2 relative z-10 backdrop-blur-xl rounded-t-2xl">
              <Lightbulb size={16} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy/80">Quick Tips</h3>
            </div>
            <div className="p-5 md:p-6 lg:p-8 flex-1">
              <ul className="space-y-4 text-sm text-navy/80">
                <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Keep titles between 10-60 characters for optimal click-through rates.</span></li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Write rich descriptions (100-300 chars) highlighting unique features.</span></li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Upload at least 3 high-quality images per listing.</span></li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Tag minimum 3 relevant amenities to match user searches.</span></li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Ensure locality and city data is accurate for geo-searches.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
