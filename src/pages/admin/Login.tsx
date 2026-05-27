import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email !== 'questhousingblr@gmail.com') {
      toast.error('Unauthorized. Only the master admin can log in.');
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-light text-navy stitch-grid font-sans">
      <Toaster richColors position="top-right" />
      
      <div className="container relative z-10 mx-auto px-6 md:px-12 max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white border-stitch p-10 shadow-xl relative"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-medium uppercase tracking-widest mb-2 text-navy">Quest <span className="font-light">Admin</span></h1>
            <p className="text-navy/50 text-sm">Secure Command Center</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/50 ml-1">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-navy/30">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-light border border-navy/10 px-5 py-4 pl-12 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy text-sm" 
                  placeholder="questhousingblr@gmail.com" 
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy/50 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-navy/30">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-light border border-navy/10 px-5 py-4 pl-12 focus:outline-none focus:border-navy focus:bg-white transition-colors text-navy text-sm" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 mt-4 bg-navy text-white font-bold text-xs uppercase tracking-[0.2em] text-center hover:bg-navy-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-[8px_8px_0px_rgba(247,209,18,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(247,209,18,1)]"
            >
              {loading ? 'Authenticating...' : (
                <>Access Dashboard <ArrowRight size={16} /></>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-navy/10 pt-6">
            <p className="text-[10px] text-navy/40 uppercase tracking-widest">Restricted Access &middot; Authorized Personnel Only</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
