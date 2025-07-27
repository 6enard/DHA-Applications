import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  LogOut,
  Shield,
  Send,
  AlertCircle,
  Download,
  Edit,
  X,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import FileUploadService from './FileUploadService';
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
  
  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });

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

  const handleApplyForJob = async () => {
    if (!selectedJob || !applicationForm.fullName || !applicationForm.email || !applicationForm.coverLetter) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        applicantName: applicationForm.fullName,
        applicantEmail: applicationForm.email,
        applicantPhone: applicationForm.phone,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: applicationForm.coverLetter.trim(),
        notes: '',
        createdBy: currentUser?.uid || 'public-applicant',
        applicantId: currentUser?.uid || null
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // Send confirmation email
      await sendApplicationReceivedEmail(
        applicationForm.email,
        selectedJob.title,
        applicationForm.fullName
      );

      setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
      setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
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

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  // Pre-fill form with user data if signed in
  useEffect(() => {
    if (currentUser && userProfile && showApplicationModal) {
      setApplicationForm(prev => ({
        ...prev,
        fullName: prev.fullName || userProfile.displayName || '',
        email: prev.email || currentUser.email || ''
      }));
    }
  }, [currentUser, userProfile, showApplicationModal]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview-scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'hired':
        return <CheckCircle className="w-4 h-4" />;
      case 'shortlisted':
        return <Eye className="w-4 h-4" />;
      case 'under-review':
        return <Clock className="w-4 h-4" />;
      case 'interview-scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-600">Digital Health Agency - Career Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.displayName}</p>
                <p className="text-sm text-gray-500">{userProfile?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          </div>
        </div>
      )}
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'applications', label: 'My Applications', icon: FileText },
              { id: 'jobs', label: 'Available Jobs', icon: Briefcase },
              { id: 'profile', label: 'Profile', icon: Edit }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-gray-900">{shortlistedApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-gray-900">{successfulApplications}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.jobTitle}</p>
                        <p className="text-sm text-gray-500">{application.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1">{application.status.replace('-', ' ')}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {application.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {application.department}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied: {application.submittedAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Updated: {application.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-2">{application.status.replace('-', ' ')}</span>
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-gray-700 text-sm line-clamp-3">{application.coverLetter}</p>
                  </div>
                  
                  {application.notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">HR Notes</h4>
                      <p className="text-blue-800 text-sm">{application.notes}</p>
                    </div>
                  )}
                </div>
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
                  </div>
                </div>
              )}

              {availableJobs.map((job) => {
                const daysLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const hasApplied = applications.some(app => app.jobId === job.id);
                
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {job.department}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {job.type.replace('-', ' ')}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="ml-6 text-right">
                        <div className={`text-sm font-medium mb-2 ${
                          daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                        </div>
                        {hasApplied && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Applied
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Posted: {job.postedAt.toLocaleDateString()} | Deadline: {job.deadline.toLocaleDateString()}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobModal(true);
                          }}
                          className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          View Details
                        </button>
                        {!hasApplied ? (
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowApplicationModal(true);
                              setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
                              setError('');
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                          >
                            Already Applied
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <span>{selectedJob.department}</span>
                <span>{selectedJob.location}</span>
                <span className="capitalize">{selectedJob.type}</span>
                <span>{selectedJob.salary}</span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Job Description</h3>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {selectedJob.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">Application Deadline</p>
                    <p className="text-gray-600">{selectedJob.deadline.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Posted</p>
                    <p className="text-gray-600">{selectedJob.postedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowJobModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {!applications.some(app => app.jobId === selectedJob.id) && (
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setShowApplicationModal(true);
                      setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
                      setError('');
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply for this Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Apply for {selectedJob.title}</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleApplyForJob();
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us why you're interested in this position and how your skills and experience make you a great fit..."
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {applicationForm.coverLetter.length}/1000 characters
                  </p>
                </div>
                
                <FileUploadService
                  onFileUpload={handleFileUpload}
                  acceptedTypes={['.pdf', '.doc', '.docx']}
                  maxFileSize={5}
                  maxFiles={3}
                  label="Supporting Documents"
                  description="Upload your resume, cover letter, certificates, and other relevant documents"
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Application Information</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>Position: {selectedJob.title}</p>
                    <p>Department: {selectedJob.department}</p>
                    <p>Location: {selectedJob.location}</p>
                    <p>Application Deadline: {selectedJob.deadline.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !applicationForm.fullName || !applicationForm.email || !applicationForm.coverLetter}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </button>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;