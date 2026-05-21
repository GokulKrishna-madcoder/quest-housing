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
import ScrollToTop from './components/ScrollToTop';

// Admin Routes
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import OwnerLeads from './pages/admin/OwnerLeads';
import TenantLeads from './pages/admin/TenantLeads';

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
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="owner-leads" element={<OwnerLeads />} />
          <Route path="tenant-leads" element={<TenantLeads />} />
        </Route>
      </Routes>
    </Router>
  );
}

