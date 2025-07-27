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
  Clock, 
  XCircle, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  DollarSign,
  LogOut,
  Shield,
  Download,
  Send,
  AlertCircle,
  TrendingUp,
  UserCheck,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailNotifications } from './EmailNotificationService';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
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
  const { sendStatusUpdateEmail, sendJobPostedNotification } = useEmailNotifications();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Job form state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
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
  
  // Application filters
  const [applicationFilters, setApplicationFilters] = useState({
    status: 'all',
    department: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, load sample data
      if (userProfile?.uid === 'demo-hr-user') {
        loadDemoData();
      } else {
        // Load real data from Firebase
        await Promise.all([loadJobs(), loadApplications()]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    // Demo jobs
    const demoJobs: JobListing[] = [
      {
        id: 'job-1',
        title: 'Health Data Analyst',
        department: 'Data & Analytics',
        location: 'Nairobi',
        type: 'full-time',
        salary: 'KES 80,000 - 120,000',
        description: 'Analyze healthcare data to identify trends and patterns.',
        requirements: ['Bachelor\'s degree in Statistics', 'Experience with SQL and Python'],
        responsibilities: ['Analyze healthcare data', 'Create reports and dashboards'],
        benefits: ['Health insurance', 'Professional development'],
        deadline: new Date('2024-02-15'),
        status: 'active',
        postedAt: new Date('2024-01-01'),
        createdBy: 'demo-hr-user'
      },
      {
        id: 'job-2',
        title: 'Software Developer',
        department: 'Information Technology',
        location: 'Nairobi',
        type: 'full-time',
        salary: 'KES 120,000 - 180,000',
        description: 'Develop and maintain digital health applications.',
        requirements: ['Bachelor\'s degree in Computer Science', 'Experience with React and Node.js'],
        responsibilities: ['Develop web applications', 'Maintain existing systems'],
        benefits: ['Competitive salary', 'Flexible working hours'],
        deadline: new Date('2024-02-28'),
        status: 'active',
        postedAt: new Date('2024-01-08'),
        createdBy: 'demo-hr-user'
      }
    ];

    // Demo applications
    const demoApplications: Application[] = [
      {
        id: 'app-1',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane.smith@email.com',
        applicantPhone: '+254 700 123 456',
        jobId: 'job-1',
        jobTitle: 'Health Data Analyst',
        department: 'Data & Analytics',
        status: 'under-review',
        stage: 'initial-review',
        submittedAt: new Date('2024-01-15'),
        lastUpdated: new Date('2024-01-16'),
        coverLetter: 'I am excited to apply for the Health Data Analyst position...',
        notes: 'Strong background in statistics and healthcare data.',
        createdBy: 'public-applicant'
      },
      {
        id: 'app-2',
        applicantName: 'John Doe',
        applicantEmail: 'john.doe@email.com',
        applicantPhone: '+254 700 789 012',
        jobId: 'job-2',
        jobTitle: 'Software Developer',
        department: 'Information Technology',
        status: 'shortlisted',
        stage: 'technical-review',
        submittedAt: new Date('2024-01-20'),
        lastUpdated: new Date('2024-01-22'),
        coverLetter: 'I have 5 years of experience in full-stack development...',
        notes: 'Excellent technical skills, good portfolio.',
        createdBy: 'public-applicant'
      }
    ];

    setJobs(demoJobs);
    setApplications(demoApplications);
  };

  const loadJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
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
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, orderBy('submittedAt', 'desc'));
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

  const handleCreateJob = async () => {
    try {
      if (!jobForm.title || !jobForm.department || !jobForm.description) {
        setError('Please fill in all required fields');
        return;
      }

      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: jobForm.benefits.filter(benefit => benefit.trim() !== ''),
        deadline: new Date(jobForm.deadline),
        postedAt: new Date(),
        createdBy: currentUser?.uid || 'unknown'
      };

      if (userProfile?.uid === 'demo-hr-user') {
        // Demo mode - just add to local state
        const newJob: JobListing = {
          id: `job-${Date.now()}`,
          ...jobData
        };
        setJobs(prev => [newJob, ...prev]);
        setSuccess('Job posted successfully!');
      } else {
        // Real mode - save to Firebase
        await addDoc(collection(db, 'jobs'), {
          ...jobData,
          postedAt: serverTimestamp(),
          deadline: new Date(jobForm.deadline)
        });
        await loadJobs();
        setSuccess('Job posted successfully!');
      }

      // Send notification
      await sendJobPostedNotification(jobForm.title, jobForm.department);
      
      resetJobForm();
      setShowJobModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job');
    }
  };

  const handleUpdateJob = async () => {
    try {
      if (!editingJob || !jobForm.title || !jobForm.department || !jobForm.description) {
        setError('Please fill in all required fields');
        return;
      }

      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: jobForm.benefits.filter(benefit => benefit.trim() !== ''),
        deadline: new Date(jobForm.deadline)
      };

      if (userProfile?.uid === 'demo-hr-user') {
        // Demo mode - update local state
        setJobs(prev => prev.map(job => 
          job.id === editingJob.id ? { ...job, ...jobData } : job
        ));
        setSuccess('Job updated successfully!');
      } else {
        // Real mode - update in Firebase
        await updateDoc(doc(db, 'jobs', editingJob.id), jobData);
        await loadJobs();
        setSuccess('Job updated successfully!');
      }

      resetJobForm();
      setShowJobModal(false);
      setEditingJob(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      if (userProfile?.uid === 'demo-hr-user') {
        // Demo mode - remove from local state
        setJobs(prev => prev.filter(job => job.id !== jobId));
        setSuccess('Job deleted successfully!');
      } else {
        // Real mode - delete from Firebase
        await deleteDoc(doc(db, 'jobs', jobId));
        await loadJobs();
        setSuccess('Job deleted successfully!');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      if (userProfile?.uid === 'demo-hr-user') {
        // Demo mode - update local state
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus as any, lastUpdated: new Date() }
            : app
        ));
        setSuccess('Application status updated!');
      } else {
        // Real mode - update in Firebase
        await updateDoc(doc(db, 'applications', applicationId), {
          status: newStatus,
          lastUpdated: serverTimestamp()
        });
        await loadApplications();
        setSuccess('Application status updated!');
      }

      // Send email notification
      await sendStatusUpdateEmail(
        application.applicantEmail,
        application.jobTitle,
        application.applicantName,
        newStatus
      );

      setTimeout(() => setSuccess(''), 3000);
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

  const filteredApplications = applications.filter(app => {
    const matchesStatus = applicationFilters.status === 'all' || app.status === applicationFilters.status;
    const matchesDepartment = applicationFilters.department === 'all' || app.department === applicationFilters.department;
    const matchesSearch = applicationFilters.search === '' || 
      app.applicantName.toLowerCase().includes(applicationFilters.search.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(applicationFilters.search.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(applicationFilters.search.toLowerCase());
    
    return matchesStatus && matchesDepartment && matchesSearch;
  });

  // Analytics calculations
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length;
  const shortlistedApplications = applications.filter(app => app.status === 'shortlisted').length;
  const hiredApplications = applications.filter(app => app.status === 'hired').length;

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
                <p className="text-gray-600">Digital Health Agency</p>
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
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{activeJobs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-gray-900">{hiredApplications}</p>
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
                  <div key={application.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        application.status === 'hired' ? 'bg-green-100 text-green-800' :
                        application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                        application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status.replace('-', ' ')}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {application.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
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
                  setEditingJob(null);
                  setShowJobModal(true);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Post New Job
              </button>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deadline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.type}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'closed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {job.deadline.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingJob(job);
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
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={applicationFilters.search}
                    onChange={(e) => setApplicationFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={applicationFilters.status}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, status: e.target.value }))}
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
                  value={applicationFilters.department}
                  onChange={(e) => setApplicationFilters(prev => ({ ...prev, department: e.target.value }))}
                >
                  <option value="all">All Departments</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Digital Health">Digital Health</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                            <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.jobTitle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={application.status}
                            onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                              application.status === 'hired' ? 'bg-green-100 text-green-800' :
                              application.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                              application.status === 'under-review' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under-review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview-scheduled">Interview Scheduled</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.submittedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingApplications}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                    <p className="text-3xl font-bold text-blue-600">{shortlistedApplications}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-3xl font-bold text-green-600">{hiredApplications}</p>
                  </div>
                  <FileCheck className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Department Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Department</h3>
              <div className="space-y-4">
                {['Data & Analytics', 'Information Technology', 'Digital Health'].map((dept) => {
                  const deptApplications = applications.filter(app => app.department === dept).length;
                  const percentage = totalApplications > 0 ? (deptApplications / totalApplications) * 100 : 0;
                  
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{dept}</span>
                        <span className="text-gray-500">{deptApplications} applications</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
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
                {editingJob ? 'Edit Job' : 'Post New Job'}
              </h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                editingJob ? handleUpdateJob() : handleCreateJob();
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
                      <option value="Information Technology">Information Technology</option>
                      <option value="Digital Health">Digital Health</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
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
                      placeholder="e.g., KES 80,000 - 120,000"
                      value={jobForm.salary}
                      onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
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
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('requirements', index)}
                        className="text-red-600 hover:text-red-800"
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
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('responsibilities', index)}
                        className="text-red-600 hover:text-red-800"
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
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayField('benefits', index)}
                        className="text-red-600 hover:text-red-800"
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
                    onClick={() => {
                      setShowJobModal(false);
                      setEditingJob(null);
                      resetJobForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingJob ? 'Update Job' : 'Post Job'}
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

export default AdminDashboard;