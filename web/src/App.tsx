import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomersList from './pages/CustomersList';
import CustomerProfile from './pages/CustomerProfile';
import NewCustomer from './pages/NewCustomer';
import Deliveries from './pages/Deliveries';
import Payments from './pages/Payments';
import Invoices from './pages/Invoices';
import WhatsAppHub from './pages/WhatsAppHub';
import Settings from './pages/Settings';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '23719829751-hc4qrloinds1ivbk4jtcdaetcjdnu4m4.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — all under Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="customers"      element={<CustomersList />} />
            <Route path="customers/new"  element={<NewCustomer />} />
            <Route path="customers/:id"  element={<CustomerProfile />} />
            <Route path="deliveries"     element={<Deliveries />} />
            <Route path="payments"       element={<Payments />} />
            <Route path="invoices"       element={<Invoices />} />
            <Route path="whatsapp-hub"   element={<WhatsAppHub />} />
            <Route path="settings"       element={<Settings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
