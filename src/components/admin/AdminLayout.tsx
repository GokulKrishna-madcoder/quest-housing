import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Home, LogOut, Settings, Download, ClipboardList } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-light flex flex-col items-center justify-center text-navy"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Double check the admin email
  if (session.user.email !== 'questhousingblr@gmail.com') {
    supabase.auth.signOut();
    toast.error('Unauthorized access. Admin only.');
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard Analytics', path: '/admin', icon: LayoutDashboard },
    { name: 'Owner Leads', path: '/admin/owner-leads', icon: Home },
    { name: 'Tenant Leads', path: '/admin/tenant-leads', icon: Users },
    { name: 'Funnel Leads', path: '/admin/funnel-leads', icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen bg-light text-navy font-sans overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-navy/10 flex flex-col z-20 shrink-0"
      >
        <div className="p-8 border-b border-navy/10">
          <Link to="/" className="inline-block">
            <h1 className="text-xl font-display font-medium uppercase tracking-tighter">Quest <span className="font-light opacity-60">Admin</span></h1>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-navy text-white shadow-md' 
                    : 'text-navy/60 hover:text-navy hover:bg-navy/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-navy/10">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-navy/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold">A</div>
            <div className="truncate">
              <p className="text-xs font-bold text-navy">Admin</p>
              <p className="text-[10px] truncate">{session.user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-light/30 relative">
        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
