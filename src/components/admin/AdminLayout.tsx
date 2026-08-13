import { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { LayoutDashboard, Users, Home, LogOut, ClipboardList, PanelLeftClose, PanelLeft, Building2, Sparkles, MessageSquare, Inbox, CalendarClock, Search, BarChart3 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
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

  if (session.user.email !== 'questhousingblr@gmail.com') {
    supabase.auth.signOut();
    toast.error('Unauthorized access. Admin only.');
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', shortName: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', shortName: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Owner Leads', shortName: 'Owners', path: '/admin/owner-leads', icon: Home },
    { name: 'Funnel Leads', shortName: 'Funnel', path: '/admin/funnel-leads', icon: ClipboardList },
    { name: 'Properties', shortName: 'Properties', path: '/admin/properties', icon: Building2 },
    { name: 'Scheduled Visits', shortName: 'Visits', path: '/admin/scheduled-visits', icon: CalendarClock },
    { name: 'AI Analyst', shortName: 'AI', path: '/admin/ai-analyst', icon: Sparkles },
    { name: 'Chat Analytics', shortName: 'Chats', path: '/admin/chat-analytics', icon: MessageSquare },
    { name: 'Inbox', shortName: 'Inbox', path: '/admin/inbox', icon: Inbox },
    { name: 'SEO Center', shortName: 'SEO', path: '/admin/seo', icon: Search },
  ];

  return (
    <div className="flex h-screen bg-light text-navy font-sans overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex bg-navy text-white flex-col z-20 shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.15)]"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between min-h-[73px]">
          {!collapsed && (
            <Link to="/" className="inline-block px-4">
              <h1 className="text-xl font-display font-medium uppercase tracking-tighter text-white">Quest <span className="font-light opacity-80 text-white/80">Admin</span></h1>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer mx-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center mx-2' : 'mx-3'}`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : ''}`} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 mb-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold shrink-0">A</div>
              <div className="truncate">
                <p className="text-xs font-bold text-white">Admin</p>
                <p className="text-[10px] truncate">{session.user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-all ${collapsed ? 'justify-center mx-2 w-auto' : 'mx-3 w-auto'}`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </motion.aside>

      {/* ===== MOBILE HEADER (md:hidden) ===== */}
      <div className="fixed top-0 left-0 right-0 z-30 md:hidden bg-navy/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between text-white">
        <Link to="/">
          <h1 className="text-lg font-display font-medium uppercase tracking-tighter text-white">Quest <span className="font-light opacity-80 text-white/80">Admin</span></h1>
        </Link>
        <button onClick={handleLogout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <LogOut size={18} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-light stitch-grid relative">
        <div className="p-4 pt-20 md:pt-10 pb-24 md:pb-12 lg:p-14 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ===== MOBILE BOTTOM BAR (md:hidden) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/90 backdrop-blur-xl border-t border-navy/10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-center px-4 py-2 gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all shrink-0 ${
                  isActive
                    ? 'text-navy'
                    : 'text-navy/35'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-primary/20' : ''}`}>
                  <Icon size={20} className={isActive ? 'text-navy' : ''} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[60px]">{item.shortName}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for iPhone home indicator */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
