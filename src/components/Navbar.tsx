import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const links = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/#services' },
  { name: 'Properties', path: '/properties' }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const location = useLocation();
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      
      const servicesEl = document.getElementById('services');
      if (servicesEl) {
        const rect = servicesEl.getBoundingClientRect();
        // If the top of the element is near the top of the viewport
        if (rect.top <= 150 && rect.bottom >= 150) {
          setActiveSection('#services');
        } else {
          setActiveSection('');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash === '#services') {
      const element = document.getElementById('services');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  const isHome = location.pathname === '/';
  const isLightText = isHome || scrolled;

  const getIsActive = (path: string) => {
    if (path === '/#services') return activeSection === '#services' || location.hash === '#services';
    if (path === '/') return location.pathname === '/' && activeSection !== '#services' && location.hash !== '#services';
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-[#0a0f1c]/70 backdrop-blur-[18px] py-4 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-b border-white/10" : "bg-transparent py-8"
      )}
    >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={isLightText ? "/logos/white_logo.png" : "/logos/dark_logo.png"} 
            alt="Quest Housing" 
            className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
          <span className={cn(
            "text-2xl font-bold tracking-tight uppercase font-display transition-colors",
            isLightText ? "text-white" : "text-navy"
          )}>
            Quest <span className="font-light opacity-60">Housing</span>
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const active = getIsActive(link.path);
            return (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "relative text-xs uppercase tracking-[0.2em] transition-colors py-2 overflow-hidden group",
                active 
                  ? (isLightText ? "text-white font-bold" : "text-navy font-bold") 
                  : (isLightText ? "text-white/70 font-medium hover:text-white" : "text-navy/70 font-medium hover:text-navy")
              )}
            >
              {link.name}
              <span className={cn(
                "absolute bottom-0 left-0 w-full h-[1px] transform origin-left transition-transform duration-300",
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                isLightText ? "bg-primary" : "bg-navy"
              )}></span>
            </Link>
          )})}
          <Link 
            to="/register" 
            className={cn(
              "px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-full shadow-[0_4px_15px_rgba(255,255,255,0.1)]",
              isLightText ? "bg-white text-navy hover:bg-primary" : "bg-navy text-white hover:bg-primary hover:text-navy"
            )}
          >
            Register
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/saved" className={cn("p-2 rounded-full transition-colors", isLightText ? "text-white/70 hover:text-white" : "text-navy/70 hover:text-navy")}>
                <Heart size={18} />
              </Link>
              <button onClick={signOut}
                className={cn("p-2 rounded-full transition-colors cursor-pointer", isLightText ? "text-white/70 hover:text-white" : "text-navy/70 hover:text-navy")}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] font-bold transition-all rounded-full cursor-pointer",
                isLightText ? "text-white/70 border border-white/20 hover:bg-white/10" : "text-navy/70 border border-navy/20 hover:bg-navy/5"
              )}>
              <LogIn size={14} /> Sign In
            </button>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className={cn(
            "md:hidden p-2 transition-colors",
            isLightText ? "text-white" : "text-navy"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-dark/95 backdrop-blur-2xl overflow-hidden shadow-2xl border-b border-white/10"
          >
            <nav className="flex flex-col px-6 py-8 gap-6">
              {links.map((link) => {
                const active = getIsActive(link.path);
                return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-xl font-display uppercase tracking-widest transition-colors",
                    active ? "text-primary" : "text-white/80"
                  )}
                >
                  {link.name}
                </Link>
                );
              })}
              <Link 
                to="/register" 
                className="mt-4 px-6 py-4 bg-primary text-navy text-center font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-xl"
              >
                Register Now
              </Link>
              {user ? (
                <div className="flex items-center gap-4 mt-2">
                  <Link to="/saved" className="flex items-center gap-2 text-white/80 text-sm"><Heart size={16} /> Saved</Link>
                  <button onClick={signOut} className="flex items-center gap-2 text-red-400 text-sm cursor-pointer"><LogOut size={16} /> Sign Out</button>
                </div>
              ) : (
                <button onClick={signInWithGoogle}
                  className="mt-2 flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white text-xs uppercase tracking-widest font-bold rounded-full hover:bg-white/10 transition-all cursor-pointer">
                  <LogIn size={14} /> Sign In with Google
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
