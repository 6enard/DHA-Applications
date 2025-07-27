import React, { useState, useEffect } from 'react';
import { User, FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from './layout/Header';
import LoadingSpinner from './common/LoadingSpinner';
import ApplicationCard from './applicant/ApplicationCard';

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  stage: 'initial-review' | 'technical-review' | 'interview' | 'final-decision';
  submittedAt: Date;
  lastUpdated: Date;
  coverLetter: string;
  notes: string;
  createdBy: string;
}

const ApplicantDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser]);

  const fetchApplications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef,
        where('applicantId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applicationsData: Application[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          applicationsData.push({
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt.toDate(),
            lastUpdated: data.lastUpdated.toDate()
          } as Application);
        });

        setApplications(applicationsData);
        
        // Calculate stats
        const newStats = {
          total: applicationsData.length,
          submitted: applicationsData.filter(app => app.status === 'submitted').length,
          underReview: applicationsData.filter(app => app.status === 'under-review').length,
          shortlisted: applicationsData.filter(app => app.status === 'shortlisted').length,
          rejected: applicationsData.filter(app => app.status === 'rejected').length
        };
        setStats(newStats);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your applications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="My Applications"
        subtitle="Digital Health Agency - Applicant Portal"
        userProfile={userProfile}
        onLogout={logout}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600">Track your job applications and their status</p>
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Yet</h3>
              <p className="text-gray-500">Start applying to jobs to see your applications here.</p>
            </div>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;