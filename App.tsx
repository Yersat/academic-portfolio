
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { SiteData } from './types';
import { INITIAL_DATA } from './constants';
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
  const [data, setData] = useState<SiteData>(() => {
    const saved = localStorage.getItem('academic_site_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('academic_site_data', JSON.stringify(data));
  }, [data]);

  const handleUpdateData = (newData: SiteData) => setData(newData);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout profile={data.profile} />}>
        <Route path="/" element={<Home data={data} />} />
        <Route path="/about" element={<About profile={data.profile} />} />
        <Route path="/books" element={<Books books={data.books} />} />
        <Route path="/books/:id" element={<BookDetail books={data.books} />} />
        <Route path="/media" element={<Media media={data.media} />} />
        <Route path="/research" element={<Research research={data.research} />} />
        <Route path="/contact" element={<Contact profile={data.profile} />} />

        {/* Payment result pages */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin onLogin={() => setIsAuthenticated(true)} />} />
      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <AdminLayout onLogout={() => setIsAuthenticated(false)}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard data={data} />} />
                <Route path="books" element={<AdminBooks data={data} onUpdate={handleUpdateData} />} />
                <Route path="media" element={<AdminMedia data={data} onUpdate={handleUpdateData} />} />
                <Route path="pages" element={<AdminPages data={data} onUpdate={handleUpdateData} />} />
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
