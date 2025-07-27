import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmailNotificationProvider } from './components/EmailNotificationService';
import Header from './components/layout/Header';
import Modal from './components/common/Modal';
import LoadingSpinner from './components/common/LoadingSpinner';
import Login from './components/Login';
import Register from './components/Register';
import JobBoard from './components/JobBoard';
import ApplicantDashboard from './components/ApplicantDashboard';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const handleApplyForJob = (jobId: string) => {
    if (!currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setAppliedJobs(prev => [...prev, jobId]);
  };

  // If user is authenticated, show appropriate dashboard
  if (currentUser && userProfile) {
    if (userProfile.role === 'admin' || userProfile.role === 'hr') {
      return <AdminDashboard />;
    } else {
      return <ApplicantDashboard />;
    }
  }

  // Public view - show job board with authentication modal
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Digital Health Agency"
        subtitle="Career Opportunities Portal"
        showAuth={true}
        onSignIn={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onSignUp={() => {
          setAuthMode('register');
          setShowAuthModal(true);
        }}
      />

      {/* Job Board */}
      <JobBoard onApply={handleApplyForJob} appliedJobs={appliedJobs} />

      {/* Authentication Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authMode === 'login' ? 'Sign In' : 'Create Account'}
        maxWidth="md"
      >
        {authMode === 'login' ? (
          <Login
            onToggleMode={() => setAuthMode('register')}
            onClose={() => setShowAuthModal(false)}
          />
        ) : (
          <Register
            onToggleMode={() => setAuthMode('login')}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <EmailNotificationProvider>
        <AppContent />
      </EmailNotificationProvider>
    </AuthProvider>
  );
}

export default App;