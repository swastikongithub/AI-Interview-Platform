import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { RoleGuard } from './components/auth/RoleGuard';
import { LoginPage } from './pages/auth/LoginPage';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ProfilePage } from './pages/candidate/ProfilePage';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { InterviewerDashboard } from './pages/interviewer/InterviewerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { ComponentPlayground } from './pages/dev/ComponentPlayground';
import { config } from './config';

import { ToastProvider } from './components/common/Toast';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Component Playground (Dev Only) */}
              {config.env === 'development' && (
                <Route path="/dev/components" element={<ComponentPlayground />} />
              )}

            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/candidate/dashboard" replace />} />

            {/* Candidate Routes */}
            <Route
              path="/candidate/dashboard"
              element={
                <RoleGuard allowedRoles={['candidate']}>
                  <CandidateDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="/candidate/profile"
              element={
                <RoleGuard allowedRoles={['candidate']}>
                  <ProfilePage />
                </RoleGuard>
              }
            />

            {/* Recruiter Routes */}
            <Route
              path="/recruiter/dashboard"
              element={
                <RoleGuard allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </RoleGuard>
              }
            />

            {/* Interviewer Routes */}
            <Route
              path="/interviewer/dashboard"
              element={
                <RoleGuard allowedRoles={['interviewer']}>
                  <InterviewerDashboard />
                </RoleGuard>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
