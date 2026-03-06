import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TechnicalSessionsPage from './pages/TechnicalSessionsPage';
import NonTechnicalSessionsPage from './pages/NonTechnicalSessionsPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AttendanceDashboard from './pages/AttendanceDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CertificationDashboard from './pages/CertificationDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import BackgroundHUD from './components/BackgroundHUD';
import StaffSection from './components/StaffSection';
import Footer from './components/Footer';
import './App.css';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const isAdminPage =
    location.pathname.includes('admin') ||
    location.pathname.includes('coordinator') ||
    location.pathname === '/login' ||
    location.pathname === '/dashboard';

  return (
    <div className="min-h-screen text-white font-sans selection:bg-tech-cyan/30 selection:text-tech-cyan flex flex-col relative z-0">
      <BackgroundHUD />

      {!isAdminPage && <Navbar />}

      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/technical" element={<TechnicalSessionsPage />} />
          <Route path="/non-technical" element={<NonTechnicalSessionsPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ParticipantDashboard />} />

          {/* Admin 1-4: protected by regular admin_session */}
          <Route path="/admin-control-pannel-1" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin-control-pannel-2" element={<ProtectedRoute><AttendanceDashboard /></ProtectedRoute>} />
          <Route path="/coordinator-panel-3" element={<ProtectedRoute><CoordinatorDashboard /></ProtectedRoute>} />
          <Route path="/admin-control-pannel-4" element={<ProtectedRoute><CertificationDashboard /></ProtectedRoute>} />

          {/* Admin 5: protected by separate super_admin_session key */}
          <Route path="/admin-control-pannel-5" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        </Routes>
      </main>

      {!isAdminPage && <StaffSection />}
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
