import React, { useState, useEffect } from 'react';
import { Users, Briefcase, FileText, BarChart3, Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import Header from './layout/Header';
import TabNavigation from './layout/TabNavigation';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import AlertMessage from './common/AlertMessage';
import StatsCards from './admin/StatsCards';
import JobsList from './admin/JobsList';
import ApplicationsList from './admin/ApplicationsList';
import JobForm from './admin/JobForm';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  salary: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  deadline: Date;
  status: 'active' | 'closed' | 'draft';
  postedAt: Date;
  createdBy: string;
}

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

const AdminDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { sendStatusUpdateEmail, sendInterviewScheduledEmail } = useEmailNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'jobs', label: 'Job Management', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: Users }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadJobs(), loadApplications()]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: JobListing[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          jobsData.push({
            id: doc.id,
            ...data,
            deadline: data.deadline.toDate(),
            postedAt: data.postedAt.toDate()
          } as JobListing);
        });
        setJobs(jobsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, orderBy('submittedAt', 'desc'));
      
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
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    setSubmitting(true);
    setError('');

    try {
      const jobData = {
        ...e,
        deadline: new Date(e.deadline),
        requirements: e.requirements.filter(req => req.trim() !== ''),
        responsibilities: e.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: e.benefits.filter(benefit => benefit.trim() !== ''),
        postedAt: editingJob ? editingJob.postedAt : new Date(),
        createdBy: currentUser?.uid || 'unknown',
        lastUpdated: new Date()
      };

      if (editingJob) {
        await updateDoc(doc(db, 'jobs', editingJob.id), {
          ...jobData,
          lastUpdated: serverTimestamp()
        });
        setSuccess('Job updated successfully!');
      } else {
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          postedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
        setSuccess('Job posted successfully!');
      }

      setShowJobModal(false);
      setEditingJob(null);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error saving job:', error);
      setError('Failed to save job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setSuccess('Job deleted successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string, notes?: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        notes: notes || application.notes,
        lastUpdated: serverTimestamp()
      });

      // Send email notification
      await sendStatusUpdateEmail(
        application.applicantEmail,
        application.jobTitle,
        application.applicantName,
        newStatus
      );

      setSuccess('Application status updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status.');
    }
  };

  const openJobModal = (job?: JobListing) => {
    setEditingJob(job || null);
    setShowJobModal(true);
    setError('');
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    app.status === 'submitted' || app.status === 'under-review'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="HR Dashboard"
        subtitle="Digital Health Agency - Admin Portal"
        userProfile={userProfile}
        onLogout={logout}
      />

      {/* Success/Error Messages */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AlertMessage type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as any)}
        />
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Welcome to HR Dashboard</h2>
              <p className="text-green-100 text-lg">
                Manage job postings, review applications, and track hiring progress for the Digital Health Agency.
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards
              totalJobs={totalJobs}
              activeJobs={activeJobs}
              totalApplications={totalApplications}
              pendingApplications={pendingApplications}
            />

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 5).map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
                
                {applications.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No applications yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Jobs Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
              <button
                onClick={() => openJobModal()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </button>
            </div>

            {/* Jobs List */}
            <JobsList
              jobs={jobs}
              onEdit={openJobModal}
              onDelete={handleDeleteJob}
            />
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Application Management</h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under-review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview-scheduled">Interview Scheduled</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            <ApplicationsList
              applications={filteredApplications}
              onUpdateStatus={handleUpdateApplicationStatus}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-600">
                Detailed analytics and reporting features will be available in the next update.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Job Modal */}
      <Modal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        title={editingJob ? 'Edit Job' : 'Post New Job'}
        maxWidth="4xl"
      >
        <JobForm
          job={editingJob}
          onSubmit={handleSaveJob}
          onCancel={() => setShowJobModal(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;