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
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Send,
  LogOut,
  Shield,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
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
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  stage: string;
  submittedAt: Date;
  lastUpdated: Date;
  coverLetter: string;
  notes: string;
  createdBy: string;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const { sendStatusUpdateEmail, sendInterviewScheduledEmail, sendJobPostedNotification } = useEmailNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

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
    loadJobs();
    loadApplications();
  }, [currentUser]);

  const loadJobs = async () => {
    try {
      // Load real jobs from Firebase
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            deadline: data.deadline?.toDate(),
            postedAt: data.postedAt?.toDate(),
          } as JobListing;
        });
        
        // Add demo jobs for demo admin
        if (currentUser?.uid === 'demo-admin-user') {
          const demoJobs: JobListing[] = [
            {
              id: 'demo-job-1',
              title: 'Senior Health Data Analyst',
              department: 'Data & Analytics',
              location: 'Nairobi',
              type: 'full-time',
              salary: 'KES 100,000 - 150,000',
              description: 'Lead our data analytics team in transforming healthcare data into actionable insights.',
              requirements: ['Masters in Statistics/Data Science', '5+ years experience', 'Python/R expertise'],
              responsibilities: ['Lead data analysis projects', 'Mentor junior analysts', 'Present to stakeholders'],
              benefits: ['Health insurance', 'Professional development', 'Flexible hours'],
              deadline: new Date('2024-03-15'),
              status: 'active',
              postedAt: new Date('2024-01-20'),
              createdBy: 'demo-admin-user'
            },
            {
              id: 'demo-job-2',
              title: 'Digital Health Project Manager',
              department: 'Digital Health',
              location: 'Mombasa',
              type: 'full-time',
              salary: 'KES 120,000 - 170,000',
              description: 'Manage digital health implementation projects across coastal Kenya.',
              requirements: ['PMP certification', 'Health sector experience', 'Stakeholder management'],
              responsibilities: ['Project planning', 'Team coordination', 'Risk management'],
              benefits: ['Travel allowance', 'Health coverage', 'Performance bonuses'],
              deadline: new Date('2024-03-20'),
              status: 'active',
              postedAt: new Date('2024-01-25'),
              createdBy: 'demo-admin-user'
            }
          ];
          setJobs([...jobsData, ...demoJobs]);
        } else {
          setJobs(jobsData);
        }
        
        console.log('✅ Jobs loaded:', jobsData.length);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
    }
  };

  const loadApplications = async () => {
    try {
      // Load real applications from Firebase
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, orderBy('submittedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applicationsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate(),
            lastUpdated: data.lastUpdated?.toDate(),
          } as Application;
        });
        
        // Add demo applications for demo admin
        if (currentUser?.uid === 'demo-admin-user') {
          const demoApplications: Application[] = [
            {
              id: 'demo-app-1',
              applicantId: 'demo-applicant-1',
              applicantName: 'John Doe',
              applicantEmail: 'john.doe@email.com',
              applicantPhone: '+254 700 123 456',
              jobId: 'demo-job-1',
              jobTitle: 'Senior Health Data Analyst',
              department: 'Data & Analytics',
              status: 'under-review',
              stage: 'technical-review',
              submittedAt: new Date('2024-01-22'),
              lastUpdated: new Date('2024-01-23'),
              coverLetter: 'I am excited to apply for this position. With 6 years of experience in health data analysis...',
              notes: 'Strong technical background, good communication skills',
              createdBy: 'demo-applicant-1'
            },
            {
              id: 'demo-app-2',
              applicantId: 'demo-applicant-2',
              applicantName: 'Jane Smith',
              applicantEmail: 'jane.smith@email.com',
              applicantPhone: '+254 700 789 012',
              jobId: 'demo-job-2',
              jobTitle: 'Digital Health Project Manager',
              department: 'Digital Health',
              status: 'shortlisted',
              stage: 'interview-prep',
              submittedAt: new Date('2024-01-26'),
              lastUpdated: new Date('2024-01-27'),
              coverLetter: 'As a certified PMP with extensive health sector experience...',
              notes: 'Excellent project management experience, ready for interview',
              createdBy: 'demo-applicant-2'
            }
          ];
          setApplications([...applicationsData, ...demoApplications]);
        } else {
          setApplications(applicationsData);
        }
        
        console.log('✅ Applications loaded:', applicationsData.length);
      });

      setLoading(false);
      return unsubscribe;
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim()),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim()),
        benefits: jobForm.benefits.filter(benefit => benefit.trim()),
        deadline: new Date(jobForm.deadline),
        postedAt: serverTimestamp(),
        createdBy: currentUser?.uid || 'unknown'
      };

      // Skip Firebase for demo user
      if (currentUser?.uid !== 'demo-admin-user') {
        await addDoc(collection(db, 'jobs'), jobData);
        
        // Send job posted notification
        await sendJobPostedNotification(jobForm.title, jobForm.department);
      }

      setSuccess('Job posted successfully!');
      setShowJobModal(false);
      resetJobForm();
      
      // Refresh jobs list
      loadJobs();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // Skip Firebase for demo applications
      if (!applicationId.startsWith('demo-')) {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          status: newStatus,
          lastUpdated: serverTimestamp()
        });
      }

      // Send status update email
      await sendStatusUpdateEmail(
        application.applicantEmail,
        application.jobTitle,
        application.applicantName,
        newStatus
      );

      setSuccess(`Application status updated to ${newStatus.replace('-', ' ')}`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status');
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

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interview-scheduled': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'submitted': return <Clock className="w-4 h-4" />;
      case 'under-review': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'interview-scheduled': return <Calendar className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hired': return <UserCheck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || app.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length,
    shortlistedCandidates: applications.filter(app => app.status === 'shortlisted').length,
    hiredCandidates: applications.filter(app => app.status === 'hired').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
                <p className="text-gray-600">Digital Health Agency - Human Resources</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userProfile?.displayName}</span>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.hiredCandidates}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 5).map(application => (
                  <div key={application.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.applicantName}</p>
                        <p className="text-sm text-gray-600">{application.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('-', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {application.submittedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
              <button
                onClick={() => {
                  resetJobForm();
                  setShowJobModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </button>
            </div>

            <div className="grid gap-6">
              {jobs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="ml-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 
                        job.status === 'closed' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Posted: {job.postedAt.toLocaleDateString()} | Deadline: {job.deadline.toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          // Populate form for editing
                          setJobForm({
                            title: job.title,
                            department: job.department,
                            location: job.location,
                            type: job.type,
                            salary: job.salary,
                            description: job.description,
                            requirements: job.requirements,
                            responsibilities: job.responsibilities,
                            benefits: job.benefits,
                            deadline: job.deadline.toISOString().split('T')[0],
                            status: job.status
                          });
                          setShowJobModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this job?')) {
                            // Handle job deletion
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Digital Health">Digital Health</option>
                  <option value="Health Systems">Health Systems</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            <div className="grid gap-6">
              {filteredApplications.map(application => (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.applicantName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{application.jobTitle}</span>
                        <span>{application.department}</span>
                        <span>{application.applicantEmail}</span>
                        <span>{application.applicantPhone}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{application.coverLetter}</p>
                    </div>
                    <div className="ml-6 text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(application.status)}
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.submittedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Last updated: {application.lastUpdated.toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <select
                        value={application.status}
                        onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value as Application['status'])}
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">No applications match your current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {[
                    { status: 'submitted', count: applications.filter(app => app.status === 'submitted').length, color: 'bg-blue-500' },
                    { status: 'under-review', count: applications.filter(app => app.status === 'under-review').length, color: 'bg-yellow-500' },
                    { status: 'shortlisted', count: applications.filter(app => app.status === 'shortlisted').length, color: 'bg-green-500' },
                    { status: 'rejected', count: applications.filter(app => app.status === 'rejected').length, color: 'bg-red-500' },
                    { status: 'hired', count: applications.filter(app => app.status === 'hired').length, color: 'bg-purple-500' }
                  ].map(item => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                        <span className="text-sm text-gray-600 capitalize">{item.status.replace('-', ' ')}</span>
                      </div>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Applications by Department</h3>
                <div className="space-y-3">
                  {Array.from(new Set(applications.map(app => app.department))).map(dept => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{dept}</span>
                      <span className="font-semibold">
                        {applications.filter(app => app.department === dept).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Hiring Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Applications</span>
                    <span className="font-semibold">{stats.totalApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shortlisted</span>
                    <span className="font-semibold">{stats.shortlistedCandidates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hired</span>
                    <span className="font-semibold">{stats.hiredCandidates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold">
                      {stats.totalApplications > 0 ? Math.round((stats.hiredCandidates / stats.totalApplications) * 100) : 0}%
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
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedJob ? 'Edit Job' : 'Post New Job'}
              </h2>
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
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.department}
                      onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                    >
                      <option value="">Select Department</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                      <option value="Digital Health">Digital Health</option>
                      <option value="Health Systems">Health Systems</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Public Health">Public Health</option>
                      <option value="Finance & Administration">Finance & Administration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.location}
                      onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
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
                      Salary Range
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder="e.g., KES 80,000 - 120,000"
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
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('requirements')}
                    className="text-green-600 hover:text-green-800 text-sm"
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
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('responsibilities')}
                    className="text-green-600 hover:text-green-800 text-sm"
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
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('benefits')}
                    className="text-green-600 hover:text-green-800 text-sm"
                  >
                    + Add Benefit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.deadline}
                      onChange={(e) => setJobForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
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
                    {selectedJob ? 'Update Job' : 'Post Job'}
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
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
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
                  <h3 className="font-semibold text-gray-900 mb-2">Position Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Position:</span> {selectedApplication.jobTitle}</p>
                    <p><span className="font-medium">Department:</span> {selectedApplication.department}</p>
                    <p><span className="font-medium">Applied:</span> {selectedApplication.submittedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status & Notes</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedApplication.status)}
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status.replace('-', ' ')}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add notes about this application..."
                    value={selectedApplication.notes}
                    readOnly
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Send interview email
                    sendInterviewScheduledEmail(
                      selectedApplication.applicantEmail,
                      selectedApplication.jobTitle,
                      selectedApplication.applicantName,
                      'March 15, 2024'
                    );
                    setSuccess('Interview email sent successfully!');
                    setTimeout(() => setSuccess(''), 5000);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;