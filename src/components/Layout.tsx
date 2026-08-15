import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { TenantChatbot } from './chat/TenantChatbot';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-light text-navy">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <TenantChatbot />
    </div>
  );
}
