import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleGuard } from './components/auth/RoleGuard';
import { AppShell } from './components/shell/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { roleHome } from './lib/status';
import type { UserRole } from './types';

import { LoginPage } from './pages/auth/LoginPage';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ProfilePage } from './pages/candidate/ProfilePage';
import { ResumePage } from './pages/candidate/ResumePage';
import { JobMatchesPage } from './pages/candidate/JobMatchesPage';
import { InterviewsList } from './pages/candidate/InterviewsList';
import { InterviewDetail } from './pages/candidate/InterviewDetail';
import { InterviewSession } from './pages/candidate/InterviewSession';
import { InterviewEvaluation } from './pages/candidate/InterviewEvaluation';
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { RecruiterInterviewReview } from './pages/recruiter/RecruiterInterviewReview';
import { InterviewerDashboard } from './pages/interviewer/InterviewerDashboard';
import { EvaluationWorkspace } from './pages/interviewer/EvaluationWorkspace';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

const ALL_ROLES: UserRole[] = ['candidate', 'recruiter', 'interviewer', 'admin'];

const guard = (roles: UserRole[], element: React.ReactNode) => (
  <RoleGuard allowedRoles={roles}>{element}</RoleGuard>
);

/** Sends "/" to the signed-in role's workspace (or to sign-in via the guard). */
const HomeRedirect: React.FC = () => {
  const { role } = useAuth();
  return role ? <Navigate to={roleHome[role]} replace /> : null;
};

export const App: React.FC = () => (
  <MotionConfig reducedMotion="user">
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Immersive, shell-less interview session */}
            <Route
              path="/candidate/interviews/:id/session/:sessionId"
              element={guard(['candidate'], <InterviewSession />)}
            />

            {/* Authenticated application frame */}
            <Route element={guard(ALL_ROLES, <AppShell />)}>
              <Route path="/" element={<HomeRedirect />} />

              <Route path="/candidate/dashboard" element={guard(['candidate'], <CandidateDashboard />)} />
              <Route path="/candidate/profile" element={guard(['candidate'], <ProfilePage />)} />
              <Route path="/candidate/resume" element={guard(['candidate'], <ResumePage />)} />
              <Route path="/candidate/jobs" element={guard(['candidate'], <JobMatchesPage />)} />
              <Route path="/candidate/interviews" element={guard(['candidate'], <InterviewsList />)} />
              <Route path="/candidate/interviews/:id" element={guard(['candidate'], <InterviewDetail />)} />
              <Route path="/candidate/interviews/:id/evaluation" element={guard(['candidate'], <InterviewEvaluation />)} />

              <Route path="/recruiter/dashboard" element={guard(['recruiter'], <RecruiterDashboard />)} />
              <Route path="/recruiter/interviews/:id" element={guard(['recruiter'], <RecruiterInterviewReview />)} />

              <Route path="/interviewer/dashboard" element={guard(['interviewer'], <InterviewerDashboard />)} />
              <Route path="/interviewer/interviews/:id" element={guard(['interviewer'], <EvaluationWorkspace />)} />

              <Route path="/admin/dashboard" element={guard(['admin'], <AdminDashboard />)} />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </MotionConfig>
);

export default App;
