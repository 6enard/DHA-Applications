import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmailNotificationProvider } from './components/EmailNotificationService';
import Login from './components/Login';
import Register from './components/Register';
import JobBoard from './components/JobBoard';
import ApplicantDashboard from './components/ApplicantDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Shield, Briefcase, Users, X } from 'lucide-react';

function AppContent() {
  const { currentUser, userProfile, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Digital Health Agency</h1>
                <p className="text-gray-600">Career Opportunities Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Board */}
      <JobBoard onApply={handleApplyForJob} appliedJobs={appliedJobs} />

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
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
            </div>
          </div>
        </div>
      )}
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