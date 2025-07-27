import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
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
  Star,
  TrendingUp,
  UserCheck,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
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
  const { sendStatusUpdateEmail, sendJobPostedNotification } = useEmailNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract',
    salary: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    deadline: '',
    status: 'active' as 'active' | 'closed' | 'draft'
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

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

  const handleCreateJob = async () => {
    try {
      if (!jobForm.title || !jobForm.department || !jobForm.location || !jobForm.deadline) {
        setError('Please fill in all required fields');
        return;
      }

      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: jobForm.benefits.filter(benefit => benefit.trim() !== ''),
        deadline: new Date(jobForm.deadline),
        postedAt: serverTimestamp(),
        createdBy: currentUser?.uid || 'admin'
      };

      if (isEditing && selectedJob) {
        await updateDoc(doc(db, 'jobs', selectedJob.id), {
          ...jobData,
          postedAt: selectedJob.postedAt // Keep original posted date when editing
        });
        setSuccess('Job updated successfully!');
      } else {
        await addDoc(collection(db, 'jobs'), jobData);
        await sendJobPostedNotification(jobForm.title, jobForm.department);
        setSuccess('Job posted successfully!');
      }

      resetJobForm();
      setShowJobModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error saving job:', error);
      setError('Failed to save job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'jobs', jobId));
        setSuccess('Job deleted successfully!');
        setTimeout(() => setSuccess(''), 5000);
      } catch (error) {
        console.error('Error deleting job:', error);
        setError('Failed to delete job. Please try again.');
      }
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        lastUpdated: serverTimestamp(),
        notes: `Status updated to ${newStatus} by ${userProfile?.displayName || 'Admin'}`
      });

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
      setError('Failed to update application status. Please try again.');
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '',
      department: '',
      location: '',
      type: 'full-time',
      salary: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      deadline: '',
      status: 'active'
    });
    setIsEditing(false);
    setSelectedJob(null);
  };

  const editJob = (job: JobListing) => {
    setJobForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.length > 0 ? job.requirements : [''],
      responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
      benefits: job.benefits.length > 0 ? job.benefits : [''],
      deadline: job.deadline.toISOString().split('T')[0],
      status: job.status
    });
    setSelectedJob(job);
    setIsEditing(true);
    setShowJobModal(true);
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setJobForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setJobForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setJobForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

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
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active' && job.deadline > new Date()).length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => 
    app.status === 'submitted' || app.status === 'under-review'
  ).length;
  const shortlistedApplications = applications.filter(app => 
    app.status === 'shortlisted' || app.status === 'interview-scheduled'
  ).length;
  const hiredApplicants = applications.filter(app => app.status === 'hired').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Digital Health Agency - HR Management</p>
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

      {/* Success/Error Messages */}
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

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'jobs', label: 'Job Management', icon: Briefcase },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                Manage job postings, review applications, and oversee the hiring process for the Digital Health Agency.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
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
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-gray-900">{hiredApplicants}</p>
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
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.applicantName}</p>
                        <p className="text-sm text-gray-500">{application.jobTitle}</p>
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
                onClick={() => {
                  resetJobForm();
                  setShowJobModal(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </button>
            </div>

            {/* Jobs List */}
            <div className="space-y-4">
              {jobs.map((job) => {
                const daysLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpired = daysLeft <= 0;
                
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Expired
                            </span>
                          )}
                        </div>
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
                            <Calendar className="w-4 h-4 mr-1" />
                            Deadline: {job.deadline.toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-gray-700 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="ml-6 flex space-x-2">
                        <button
                          onClick={() => editJob(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Posted: {job.postedAt.toLocaleDateString()}</span>
                      <span>
                        {applications.filter(app => app.jobId === job.id).length} applications
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {jobs.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Start by posting your first job opportunity.</p>
                  <button
                    onClick={() => {
                      resetJobForm();
                      setShowJobModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Post New Job
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Applications Management</h2>
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
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.applicantName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {application.applicantEmail}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {application.applicantPhone}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {application.jobTitle}
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{application.coverLetter}</p>
                    </div>
                    <div className="ml-6 text-right">
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-2">{application.status.replace('-', ' ')}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        Applied: {application.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Department: {application.department}
                    </div>
                    <div className="flex space-x-2">
                      <select
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={application.status}
                        onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under-review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview-scheduled">Interview Scheduled</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600">
                    {applications.length === 0 
                      ? "No applications have been submitted yet."
                      : "Try adjusting your search criteria."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {['submitted', 'under-review', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'].map(status => {
                    const count = applications.filter(app => app.status === status).length;
                    const percentage = totalApplications > 0 ? (count / totalApplications * 100).toFixed(1) : '0';
                    
                    return (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 capitalize">{status.replace('-', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-xs text-gray-500">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Department</h3>
                <div className="space-y-3">
                  {Array.from(new Set(jobs.map(job => job.department))).map(department => {
                    const count = jobs.filter(job => job.department === department).length;
                    
                    return (
                      <div key={department} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{department}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {applications.filter(app => {
                        const dayAgo = new Date();
                        dayAgo.setDate(dayAgo.getDate() - 1);
                        return app.submittedAt > dayAgo;
                      }).length} applications in last 24h
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {jobs.filter(job => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return job.postedAt > weekAgo;
                      }).length} jobs posted this week
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {applications.filter(app => app.status === 'hired').length} successful hires
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Job' : 'Post New Job'}
                </h2>
                <button
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateJob();
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.department}
                      onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.location}
                      onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type *
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.type}
                      onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.status}
                      onChange={(e) => setJobForm(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., KES 80,000 - 120,000"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.deadline}
                      onChange={(e) => setJobForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={jobForm.description}
                    onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                {/* Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  {jobForm.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={req}
                        onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                        placeholder="Enter requirement"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('requirements')}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Add Requirement
                  </button>
                </div>
                
                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities
                  </label>
                  {jobForm.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={resp}
                        onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                        placeholder="Enter responsibility"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('responsibilities', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('responsibilities')}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Add Responsibility
                  </button>
                </div>
                
                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  {jobForm.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={benefit}
                        onChange={(e) => updateArrayField('benefits', index, e.target.value)}
                        placeholder="Enter benefit"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('benefits', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('benefits')}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Add Benefit
                  </button>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {isEditing ? 'Update Job' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Applicant Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedApplication.applicantName}</p>
                    <p><span className="font-medium">Email:</span> {selectedApplication.applicantEmail}</p>
                    <p><span className="font-medium">Phone:</span> {selectedApplication.applicantPhone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Position:</span> {selectedApplication.jobTitle}</p>
                    <p><span className="font-medium">Department:</span> {selectedApplication.department}</p>
                    <p><span className="font-medium">Applied:</span> {selectedApplication.submittedAt.toLocaleDateString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.replace('-', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              
              {selectedApplication.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">{selectedApplication.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedApplication.status}
                  onChange={(e) => {
                    handleUpdateApplicationStatus(selectedApplication.id, e.target.value);
                    setShowApplicationModal(false);
                  }}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under-review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview-scheduled">Interview Scheduled</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;