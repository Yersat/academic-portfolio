
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Videos from './pages/Videos';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import CoAuthors from './pages/CoAuthors';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminVideos from './pages/admin/AdminVideos';
import AdminArticles from './pages/admin/AdminArticles';
import AdminCoAuthors from './pages/admin/AdminCoAuthors';
import AdminGallery from './pages/admin/AdminGallery';
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
        <Route path="/co-authors" element={<CoAuthors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />

        {/* Redirects for old URLs */}
        <Route path="/media" element={<Navigate to="/videos" replace />} />
        <Route path="/research" element={<Navigate to="/articles" replace />} />

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
                <Route path="articles" element={<AdminArticles />} />
                <Route path="videos" element={<AdminVideos />} />
                <Route path="co-authors" element={<AdminCoAuthors />} />
                <Route path="gallery" element={<AdminGallery />} />
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
