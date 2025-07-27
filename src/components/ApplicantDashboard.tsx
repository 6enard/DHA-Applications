import React, { useState, useEffect } from 'react';
import { User, Briefcase, FileText, Edit, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import Header from './layout/Header';
import TabNavigation from './layout/TabNavigation';
import Modal from './common/Modal';
import LoadingSpinner from './common/LoadingSpinner';
import AlertMessage from './common/AlertMessage';
import StatsCards from './admin/StatsCards';
import ApplicationCard from './applicant/ApplicationCard';
import JobCard from './jobs/JobCard';
import JobDetailsModal from './jobs/JobDetailsModal';
import ApplicationForm from './jobs/ApplicationForm';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

const ApplicantDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { sendApplicationReceivedEmail } = useEmailNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs' | 'profile'>('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableJobs, setAvailableJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'jobs', label: 'Available Jobs', icon: Briefcase },
    { id: 'profile', label: 'Profile', icon: Edit }
  ];

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (currentUser) {
        await Promise.all([loadApplications(), loadJobs()]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // No demo data - load from Firebase
    setApplications([]);
    setAvailableJobs([]);
  };

  const loadApplications = async () => {
    if (!currentUser) return;

    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef, 
        where('applicantEmail', '==', currentUser.email),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
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
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef, 
        where('status', '==', 'active'),
        orderBy('postedAt', 'desc')
      );
      
      // Use real-time listener for jobs
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: JobListing[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const job = {
            id: doc.id,
            ...data,
            deadline: data.deadline.toDate(),
            postedAt: data.postedAt.toDate()
          } as JobListing;
          
          // Only show jobs that haven't passed deadline
          if (job.deadline > new Date()) {
            jobsData.push(job);
          }
        });
        
        setAvailableJobs(jobsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleApplyForJob = async (formData: any) => {
    if (!selectedJob || !formData.fullName || !formData.email || !formData.coverLetter) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        applicantName: formData.fullName,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: formData.coverLetter.trim(),
        notes: '',
        createdBy: currentUser?.uid || 'public-applicant',
        applicantId: currentUser?.uid || null
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // Send confirmation email
      await sendApplicationReceivedEmail(
        formData.email,
        selectedJob.title,
        formData.fullName
      );

      setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
      setUploadedFiles([]);
      setShowApplicationModal(false);
      
      // Reload applications to show the new one
      await loadApplications();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    app.status === 'submitted' || app.status === 'under-review'
  ).length;
  const shortlistedApplications = applications.filter(app => 
    app.status === 'shortlisted' || app.status === 'interview-scheduled'
  ).length;
  const successfulApplications = applications.filter(app => app.status === 'hired').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="My Dashboard"
        subtitle="Digital Health Agency - Career Portal"
        userProfile={userProfile}
        onLogout={logout}
      />

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AlertMessage type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
        </div>
      )}
      
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
              <h2 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.displayName}!</h2>
              <p className="text-green-100 text-lg">
                Track your job applications and discover new opportunities at the Digital Health Agency.
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards
              totalJobs={totalApplications}
              activeJobs={pendingApplications}
              totalApplications={shortlistedApplications}
              pendingApplications={successfulApplications}
            />

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 3).map((application) => (
                  <ApplicationCard key={application.id} application={application} />
                ))}
                
                {applications.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No applications yet. Start by browsing available jobs!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
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
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or apply for some jobs!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Jobs Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>
            </div>

            {/* Available Jobs List */}
            <div className="space-y-4">
              {availableJobs.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                  <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Available Jobs</h3>
                  <div className="max-w-md mx-auto space-y-3 text-gray-600">
                    <p>You have either applied to all available positions or there are no active job postings at the moment.</p>
                    <p>New opportunities are posted regularly, so please check back soon!</p>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                      <ul className="text-sm text-blue-800 space-y-1 text-left">
                        <li>• Check your application status in the "My Applications" tab</li>
                        <li>• Follow up on pending applications</li>
                        <li>• Keep your profile updated</li>
                        <li>• Check back regularly for new opportunities</li>
                      </ul>
                    </div>
                  <JobCard
                    key={job.id}
                    job={job}
                    hasApplied={hasApplied}
                    onViewDetails={() => {
                      setSelectedJob(job);
                      setShowJobModal(true);
                    }}
                    onApply={() => {
                      setSelectedJob(job);
                      setShowApplicationModal(true);
                      setError('');
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{userProfile?.displayName}</h3>
                  <p className="text-gray-600">{userProfile?.email}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-2">
                    {userProfile?.role}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={userProfile?.displayName || ''}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={userProfile?.email || ''}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={userProfile?.role || ''}
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={userProfile?.createdAt?.toLocaleDateString() || ''}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Account Information</h4>
                <p className="text-blue-800 text-sm">
                  Your profile information is managed by the Digital Health Agency HR system. 
                  To update your personal information, please contact the HR department at hr@dha.go.ke.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onApply={() => {
          setShowJobModal(false);
          setShowApplicationModal(true);
          setError('');
        }}
        hasApplied={selectedJob ? applications.some(app => app.jobId === selectedJob.id) : false}
      />

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={selectedJob ? `Apply for ${selectedJob.title}` : 'Apply for Job'}
      >
        {selectedJob && (
          <ApplicationForm
            job={selectedJob}
            onSubmit={handleApplyForJob}
            onCancel={() => setShowApplicationModal(false)}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default ApplicantDashboard;