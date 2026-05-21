import { Link } from 'react-router-dom';
import { Instagram, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-dark pt-32 pb-10 border-t border-white/5 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-20 bg-[repeating-linear-gradient(to_right,white,white_4px,transparent_4px,transparent_8px)]" />
      <div className="stitch-grid-dark absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <img 
                src="/logos/white_logo.png" 
                alt="Quest Housing" 
                className="h-10 w-auto object-contain transition-transform hover:scale-105" 
              />
              <span className="text-3xl font-bold tracking-tight uppercase text-white font-display">Quest <span className="font-light opacity-60">Housing</span></span>
            </Link>
            <p className="text-white/60 max-w-sm mb-10 leading-relaxed font-light text-lg">
              Cinematic real estate curation. Bridging the gap between premium properties and discerning individuals in Bangalore.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/questhousing" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-navy transition-colors cursor-pointer">
                <Instagram size={20} />
              </a>
              <a href="https://wa.me/918886131316" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-navy transition-colors cursor-pointer">
                <MessageCircle size={20} />
              </a>
              <a href="mailto:questhousingblr@gmail.com" className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-navy transition-colors cursor-pointer">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs border-stitch-b-dark pb-4">Menu</h4>
            <ul className="flex flex-col gap-5 text-white/60 font-light">
              <li><Link to="/properties" className="hover:text-primary transition-colors">Portfolio</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">Our Vision</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">For Owners</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">For Tenants</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs border-stitch-b-dark pb-4">Locations</h4>
            <ul className="flex flex-col gap-5 text-white/60 font-light">
              <li>Koramangala</li>
              <li>Whitefield</li>
              <li>Indiranagar</li>
              <li>HSR Layout</li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs border-stitch-b-dark pb-4">Concierge</h4>
            <ul className="flex flex-col gap-5 text-white/60 font-light mb-8">
              <li>
                <a href="mailto:questhousingblr@gmail.com" className="hover:text-white transition-colors">
                  questhousingblr@gmail.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/918886131316" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +91-8886131316
                </a>
              </li>
            </ul>
            <Link to="/register" className="inline-flex px-8 py-4 bg-primary text-navy font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors h-14 items-center rounded-none justify-center">
              Request Callback
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-white/10 text-xs text-white/40 uppercase tracking-widest font-bold">
          <p>&copy; {new Date().getFullYear()} Quest Housing. All Rights Reserved.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
