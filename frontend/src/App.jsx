import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Context
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute'; 

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Volunteer Pages
// Use the new Bento-style dashboard
import BentoDashboard from './pages/BentoDashboard';
import Tasks from './pages/volunteer/TaskBoard';
import Profile from './pages/volunteer/Profile';
import Leaderboard from './pages/volunteer/LeaderBoard';
import AttendanceScanner from './pages/volunteer/AttendanceScanner';
import Arcade from './pages/volunteer/Arcade';
import QRScanner from './pages/volunteer/QRScanner';
import ImpactHub from './pages/ImpactHub';

// Admin Pages
import SecretaryDashboard from './pages/admin/SecretaryDashboard';
import ManageTasks from './pages/admin/ManageTasks';
import SecretaryScanner from './pages/admin/SecretaryScanner';
import UserManagement from './pages/admin/UserManagement';
import SecretaryProfile from './pages/admin/SecretaryProfile';
import DomainHeadProfile from './pages/admin/DomainHeadProfile';
import AssociateHeadProfile from './pages/admin/AssociateHeadProfile';
import EventManagement from './pages/admin/EventManagement';

// New Feature Pages
import KnowledgeBase from './pages/KnowledgeBase';
import VolunteerResume from './pages/volunteer/VolunteerResume';
import Settings from './pages/Settings';
import Assistant from './pages/Assistant';
import SecretaryOnboardingWizard from './pages/SecretaryOnboardingWizard';
import SecretaryCustomizer from './components/digital-id/SecretaryCustomizer';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import Announcements from './components/announcements/Announcements';
import Notices from './pages/Notices';
import Polls from './pages/Polls';
import Meetings from './components/meetings/Meetings';
import EventDetails from './pages/EventDetails';
import DemoCertificates from './pages/admin/DemoCertificates';
import VolunteerCertificates from './pages/volunteer/VolunteerCertificates';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Volunteer Routes */}
            <Route path="/volunteer/dashboard" element={
              <ProtectedRoute role="volunteer">
                <BentoDashboard />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/resume" element={
              <ProtectedRoute allowedRoles={['Volunteer', 'Secretary']}>
                <VolunteerResume />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/tasks" element={
              <ProtectedRoute role="volunteer">
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/profile" element={
              <ProtectedRoute role="volunteer">
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/leaderboard" element={
              <ProtectedRoute role="volunteer">
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/scan" element={
              <ProtectedRoute role="volunteer">
                <AttendanceScanner />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/arcade" element={
              <ProtectedRoute role="volunteer">
                <Arcade />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/qr-scanner" element={
              <ProtectedRoute role="volunteer">
                <QRScanner />
              </ProtectedRoute>
            } />
            <Route path="/volunteer/certificates" element={
              <ProtectedRoute role="volunteer">
                <VolunteerCertificates />
              </ProtectedRoute>
            } />

            {/* AI Assistant */}
            <Route path="/assistant" element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            } />

            {/* Legacy Routes (redirect to new paths) */}
            <Route path="/dashboard" element={<Navigate to="/volunteer/dashboard" />} />
            <Route path="/tasks" element={<Navigate to="/volunteer/tasks" />} />
            <Route path="/profile" element={<Navigate to="/volunteer/profile" />} />
            <Route path="/leaderboard" element={<Navigate to="/volunteer/leaderboard" />} />
            <Route path="/scan" element={<Navigate to="/volunteer/scan" />} />
            <Route path="/arcade" element={<Navigate to="/volunteer/arcade" />} />

            {/* Secretary Onboarding */}
            <Route path="/secretary/onboard" element={
              <ProtectedRoute role="secretary">
                <SecretaryOnboardingWizard />
              </ProtectedRoute>
            } />

            <Route path="/secretary/customizer" element={
              <ProtectedRoute role="secretary">
                <SecretaryCustomizer />
              </ProtectedRoute>
            } />

            {/* Secretary/Admin Routes */}
            <Route path="/secretary/dashboard" element={
              <ProtectedRoute role="secretary">
                <SecretaryDashboard />
              </ProtectedRoute>
            } />
            <Route path="/secretary/profile" element={
              <ProtectedRoute role="secretary">
                <SecretaryProfile />
              </ProtectedRoute>
            } />
            <Route path="/secretary/tasks" element={
              <ProtectedRoute role="secretary">
                <ManageTasks />
              </ProtectedRoute>
            } />
            <Route path="/secretary/scan" element={
              <ProtectedRoute role="secretary">
                <SecretaryScanner />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute adminOnly={true}>
                <EventManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/certificates" element={
              <ProtectedRoute role="secretary">
                <DemoCertificates />
              </ProtectedRoute>
            } />
            <Route path="/super-admin" element={
              <ProtectedRoute role="super-admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } />

            {/* Domain Head Routes */}
            <Route path="/domain-head/profile" element={
              <ProtectedRoute role="domain-head">
                <DomainHeadProfile />
              </ProtectedRoute>
            } />

            {/* Associate Head Routes */}
            <Route path="/associate-head/profile" element={
              <ProtectedRoute role="associate-head">
                <AssociateHeadProfile />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/events/:id" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />

            {/* New Feature Routes */}
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/announcements" element={
              <ProtectedRoute>
                <Announcements />
              </ProtectedRoute>
            } />
            <Route path="/notices" element={
              <ProtectedRoute>
                <Notices />
              </ProtectedRoute>
            } />
            <Route path="/polls" element={
              <ProtectedRoute>
                <Polls />
              </ProtectedRoute>
            } />
            <Route path="/meetings" element={
              <ProtectedRoute>
                <Meetings />
              </ProtectedRoute>
            } />
            <Route path="/volunteer-resume" element={
              <ProtectedRoute role="volunteer">
                <VolunteerResume />
              </ProtectedRoute>
            } />
            <Route path="/volunteer-resume/:userId" element={<VolunteerResume />} />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/impact" element={
              <ProtectedRoute>
                <ImpactHub />
              </ProtectedRoute>
            } />

            {/* Root Redirects */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;