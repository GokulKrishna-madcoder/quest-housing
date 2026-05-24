/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Registration from './pages/Registration';
import FindMyHome from './pages/FindMyHome';
import SavedProperties from './pages/SavedProperties';
import ScrollToTop from './components/ScrollToTop';

// Admin Routes
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import OwnerLeads from './pages/admin/OwnerLeads';
import FunnelLeads from './pages/admin/FunnelLeads';
import AdminProperties from './pages/admin/Properties';
import AIAnalyst from './pages/admin/AIAnalyst';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="properties" element={<Properties />} />
          <Route path="properties/:id" element={<PropertyDetails />} />
          <Route path="register" element={<Registration />} />
          <Route path="find-my-home" element={<FindMyHome />} />
          <Route path="saved" element={<SavedProperties />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="owner-leads" element={<OwnerLeads />} />
          <Route path="funnel-leads" element={<FunnelLeads />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="ai-analyst" element={<AIAnalyst />} />
        </Route>
      </Routes>
    </Router>
  );
}

