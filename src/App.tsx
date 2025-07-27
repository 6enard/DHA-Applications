import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmailNotificationProvider } from './components/EmailNotificationService';
import Login from './components/Login';
import Register from './components/Register';
import JobBoard from './components/JobBoard';
import ApplicantDashboard from './components/ApplicantDashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  // If user is authenticated, show appropriate dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <ApplicantDashboard />
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