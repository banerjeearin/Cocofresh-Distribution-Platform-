import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomersList from './pages/CustomersList';
import CustomerProfile from './pages/CustomerProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="customers/:id" element={<CustomerProfile />} />
          {/* We will add more routes here as we port them */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
