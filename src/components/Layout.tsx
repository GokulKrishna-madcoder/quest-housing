import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { TenantChatbot } from './chat/TenantChatbot';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-light text-navy">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <TenantChatbot />
    </div>
  );
}
