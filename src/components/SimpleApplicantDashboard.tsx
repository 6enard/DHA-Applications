import React from 'react';
import { User, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SimpleApplicantDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();

  // Mock application data
  const applications = [
    {
      id: '1',
      jobTitle: 'Senior Software Developer',
      department: 'Technology',
      status: 'under-review',
      appliedDate: '2024-01-15',
      lastUpdate: '2024-01-18'
    },
    {
      id: '2',
      jobTitle: 'Health Data Analyst',
      department: 'Data & Analytics',
      status: 'shortlisted',
      appliedDate: '2024-01-10',
      lastUpdate: '2024-01-20'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                <p className="text-gray-600">Digital Health Agency - Applicant Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.displayName}</p>
                <p className="text-sm text-gray-500">{userProfile?.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'under-review').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'shortlisted').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">100%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Applications</h2>
          
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>{application.department}</span>
                    <span>Applied: {application.appliedDate}</span>
                    <span>Updated: {application.lastUpdate}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                  {application.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}

          {applications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Yet</h3>
              <p className="text-gray-500">Start applying to jobs to see your applications here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleApplicantDashboard;