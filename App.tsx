
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Media from './pages/Media';
import Research from './pages/Research';
import Contact from './pages/Contact';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminMedia from './pages/admin/AdminMedia';
import AdminPages from './pages/admin/AdminPages';
import AdminLogin from './pages/admin/AdminLogin';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('admin_session_token');
  });

  const handleLogin = (token: string) => {
    localStorage.setItem('admin_session_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session_token');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/media" element={<Media />} />
        <Route path="/research" element={<Research />} />
        <Route path="/contact" element={<Contact />} />

        {/* Payment result pages */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin onLogin={handleLogin} />} />
      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <AdminLayout onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
