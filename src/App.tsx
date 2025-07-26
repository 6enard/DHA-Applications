import React, { useState } from 'react';
import { Shield, Users, FileText, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import ApplicantDashboard from './components/ApplicantDashboard';

const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {isLogin ? (
            <Login 
              onToggleMode={() => setIsLogin(false)} 
              onClose={onClose}
            />
          ) : (
            <Register 
              onToggleMode={() => setIsLogin(true)} 
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Digital Health Agency</h1>
                <p className="text-sm text-gray-600">Republic of Kenya</p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Join Kenya's Digital Health Revolution
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The Digital Health Agency is transforming healthcare delivery across Kenya through 
            innovative technology solutions. Be part of our mission to improve health outcomes 
            for all Kenyans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onOpenAuth}
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Apply for Jobs
            </button>
            <button className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a dynamic team that's making a real difference in Kenya's healthcare landscape
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Collaborative Environment</h4>
              <p className="text-gray-600">Work with passionate professionals dedicated to improving healthcare outcomes</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Meaningful Impact</h4>
              <p className="text-gray-600">Your work directly contributes to better health services for millions of Kenyans</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Growth Opportunities</h4>
              <p className="text-gray-600">Advance your career in the rapidly evolving digital health sector</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h3>
            <p className="text-gray-600">Have questions about opportunities at DHA?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Email</h4>
              <p className="text-gray-600">careers@dha.go.ke</p>
            </div>
            
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Phone</h4>
              <p className="text-gray-600">+254 20 123 4567</p>
            </div>
            
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Address</h4>
              <p className="text-gray-600">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-green-400 mr-2" />
            <span className="font-semibold">Digital Health Agency - Kenya</span>
          </div>
          <p className="text-gray-400">
            © 2024 Digital Health Agency. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show admin dashboard for HR users
  if (currentUser && (userProfile?.role === 'admin' || userProfile?.role === 'hr')) {
    return <AdminDashboard />;
  }

  // Show applicant dashboard for applicant users
  if (currentUser && userProfile?.role === 'applicant') {
    return <ApplicantDashboard />;
  }

  // Show landing page for non-authenticated users or regular applicants
  return (
    <>
      <LandingPage onOpenAuth={() => setIsAuthModalOpen(true)} />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;