import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  FileText, 
  Shield, 
  LogOut,
  Building,
  MapPin,
  DollarSign,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
  applicationsCount?: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
  }, []);

  const loadJobs = async () => {
    try {
      // Load real jobs from Firebase
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const jobsData = await Promise.all(
          querySnapshot.docs.map(async (jobDoc) => {
            const data = jobDoc.data();
            
            // Count applications for this job
            const applicationsRef = collection(db, 'applications');
            const applicationsQuery = query(applicationsRef, where('jobId', '==', jobDoc.id));
            const applicationsSnapshot = await getDocs(applicationsQuery);
            
            return {
              id: jobDoc.id,
              ...data,
              postedAt: data.postedAt?.toDate() || new Date(),
              deadline: data.deadline?.toDate() || new Date(),
              applicationsCount: applicationsSnapshot.size
            } as JobListing;
          })
        );
        
        // Add demo jobs for demo user
        if (currentUser?.uid === 'demo-admin-user') {
          const demoJobs: JobListing[] = [
            {
              id: 'demo-job-1',
              title: 'Senior Health Data Analyst',
              department: 'Data & Analytics',
              location: 'Nairobi',
              type: 'full-time',
              salary: 'KES 120,000 - 160,000',
              description: 'Lead our data analytics team in transforming healthcare data into actionable insights for policy makers and healthcare providers across Kenya.',
              requirements: [
                'Master\'s degree in Statistics, Data Science, or related field',
                'Minimum 5 years of experience in healthcare data analysis',
                'Proficiency in Python, R, SQL, and data visualization tools',
                'Experience with machine learning and predictive modeling',
                'Strong communication and leadership skills'
              ],
              responsibilities: [
                'Lead complex data analysis projects',
                'Mentor junior analysts and data scientists',
                'Collaborate with stakeholders to define data requirements',
                'Develop predictive models for health outcomes',
                'Present findings to senior management and government officials'
              ],
              benefits: [
                'Competitive salary with performance bonuses',
                'Comprehensive health insurance',
                'Professional development budget',
                'Flexible working arrangements',
                'Leadership training opportunities'
              ],
              deadline: new Date('2024-03-15'),
              status: 'active',
              postedAt: new Date('2024-01-25'),
              createdBy: 'demo-admin-user',
              applicationsCount: 12
            },
            {
              id: 'demo-job-2',
              title: 'Digital Health Project Manager',
              department: 'Digital Health',
              location: 'Kisumu',
              type: 'full-time',
              salary: 'KES 100,000 - 130,000',
              description: 'Manage large-scale digital health implementation projects across multiple counties in Western Kenya.',
              requirements: [
                'Bachelor\'s degree in Project Management, Public Health, or related field',
                'PMP certification preferred',
                'Minimum 4 years of project management experience',
                'Experience in health sector projects',
                'Strong stakeholder management skills'
              ],
              responsibilities: [
                'Plan and execute digital health projects',
                'Coordinate with county health teams',
                'Manage project budgets and timelines',
                'Ensure quality deliverables',
                'Report to donors and stakeholders'
              ],
              benefits: [
                'Competitive salary package',
                'Travel allowances',
                'Health insurance',
                'Professional certification support',
                'Career advancement opportunities'
              ],
              deadline: new Date('2024-03-01'),
              status: 'active',
              postedAt: new Date('2024-01-20'),
              createdBy: 'demo-admin-user',
              applicationsCount: 8
            }
          ];
          setJobs([...jobsData, ...demoJobs]);
        } else {
          setJobs(jobsData);
        }
      });

      setLoading(false);
      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, orderBy('submittedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applicationsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            lastUpdated: data.lastUpdated?.toDate() || new Date(),
          } as Application;
        });
        
        // Add demo applications for demo user
        if (currentUser?.uid === 'demo-admin-user') {
          const demoApplications: Application[] = [
            {
              id: 'demo-app-1',
              applicantId: 'demo-applicant-1',
              applicantName: 'Sarah Wanjiku',
              applicantEmail: 'sarah.wanjiku@email.com',
              applicantPhone: '+254 722 123 456',
              jobId: 'demo-job-1',
              jobTitle: 'Senior Health Data Analyst',
              department: 'Data & Analytics',
              status: 'under-review',
              stage: 'technical-review',
              submittedAt: new Date('2024-01-28'),
              lastUpdated: new Date('2024-01-30'),
              coverLetter: 'I am excited to apply for the Senior Health Data Analyst position. With over 6 years of experience in healthcare analytics and a proven track record of leading data-driven initiatives, I believe I would be a valuable addition to your team.',
              notes: 'Strong technical background, excellent communication skills',
              createdBy: 'demo-applicant-1'
            },
            {
              id: 'demo-app-2',
              applicantId: 'demo-applicant-2',
              applicantName: 'James Ochieng',
              applicantEmail: 'james.ochieng@email.com',
              applicantPhone: '+254 733 987 654',
              jobId: 'demo-job-2',
              jobTitle: 'Digital Health Project Manager',
              department: 'Digital Health',
              status: 'shortlisted',
              stage: 'interview-scheduled',
              submittedAt: new Date('2024-01-26'),
              lastUpdated: new Date('2024-02-01'),
              coverLetter: 'As a certified PMP with extensive experience in health sector projects, I am confident in my ability to successfully manage your digital health initiatives in Western Kenya.',
              notes: 'Interview scheduled for Feb 5th, 2024',
              createdBy: 'demo-applicant-2'
            }
          ];
          setApplications([...applicationsData, ...demoApplications]);
        } else {
          setApplications(applicationsData);
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.department || !jobForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

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
      }

      setSuccess('Job posted successfully!');
      resetJobForm();
      setShowJobModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob || !jobForm.title || !jobForm.department || !jobForm.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim()),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim()),
        benefits: jobForm.benefits.filter(benefit => benefit.trim()),
        deadline: new Date(jobForm.deadline),
        lastUpdated: serverTimestamp()
      };

      // Skip Firebase for demo user
      if (currentUser?.uid !== 'demo-admin-user') {
        await updateDoc(doc(db, 'jobs', editingJob.id), jobData);
      }

      setSuccess('Job updated successfully!');
      resetJobForm();
      setEditingJob(null);
      setShowJobModal(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      // Skip Firebase for demo user
      if (currentUser?.uid !== 'demo-admin-user') {
        await deleteDoc(doc(db, 'jobs', jobId));
      }
      setSuccess('Job deleted successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: Application['status'], notes?: string) => {
    try {
      const updateData = {
        status: newStatus,
        lastUpdated: serverTimestamp(),
        ...(notes && { notes })
      };

      // Skip Firebase for demo user
      if (currentUser?.uid !== 'demo-admin-user') {
        await updateDoc(doc(db, 'applications', applicationId), updateData);
      }

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
  };

  const openJobModal = (job?: JobListing) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements.length ? job.requirements : [''],
        responsibilities: job.responsibilities.length ? job.responsibilities : [''],
        benefits: job.benefits.length ? job.benefits : [''],
        deadline: job.deadline.toISOString().split('T')[0],
        status: job.status
      });
    } else {
      setEditingJob(null);
      resetJobForm();
    }
    setShowJobModal(true);
    setError('');
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
      case 'hired': return <CheckCircle className="w-4 h-4" />;
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Analytics calculations
  const totalApplications = applications.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const applicationsByStatus = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
                <p className="text-gray-600">Digital Health Agency - Administration</p>
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
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({totalApplications})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
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

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-gray-900">{applicationsByStatus['under-review'] || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-gray-900">{applicationsByStatus['shortlisted'] || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              <div className="p-6">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.applicantName}</p>
                        <p className="text-sm text-gray-600">{application.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
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
            {/* Jobs Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
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
              <button
                onClick={() => openJobModal()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </button>
            </div>

            {/* Jobs List */}
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'closed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {job.applicationsCount || 0} applications
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
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
                          setShowJobModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openJobModal(job)}
                        className="p-2 text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Get started by posting your first job.</p>
                <button
                  onClick={() => openJobModal()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Post New Job
                </button>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.jobTitle}</div>
                          <div className="text-sm text-gray-500">{application.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                              {application.status.replace('-', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.submittedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowApplicationModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                            >
                              View
                            </button>
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              value={application.status}
                              onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value as Application['status'])}
                            >
                              <option value="submitted">Submitted</option>
                              <option value="under-review">Under Review</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview-scheduled">Interview Scheduled</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">Applications will appear here once candidates start applying.</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Application Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(applicationsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status as Application['status'])}
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status.replace('-', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jobs by Department */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Jobs by Department</h3>
                <div className="space-y-3">
                  {Object.entries(
                    jobs.reduce((acc, job) => {
                      acc[job.department] = (acc[job.department] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([department, count]) => (
                    <div key={department} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{department}</span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {applications.slice(0, 10).map((application) => (
                  <div key={application.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {application.applicantName} applied for {application.jobTitle}
                      </p>
                      <p className="text-xs text-gray-500">
                        {application.submittedAt.toLocaleDateString()} at {application.submittedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
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
                  {editingJob ? 'Edit Job' : selectedJob ? 'Job Details' : 'Post New Job'}
                </h2>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setSelectedJob(null);
                    setEditingJob(null);
                    resetJobForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedJob && !editingJob ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Job Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Title:</span> {selectedJob.title}</p>
                        <p><span className="font-medium">Department:</span> {selectedJob.department}</p>
                        <p><span className="font-medium">Location:</span> {selectedJob.location}</p>
                        <p><span className="font-medium">Type:</span> {selectedJob.type}</p>
                        <p><span className="font-medium">Salary:</span> {selectedJob.salary}</p>
                        <p><span className="font-medium">Status:</span> {selectedJob.status}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Posted:</span> {selectedJob.postedAt.toLocaleDateString()}</p>
                        <p><span className="font-medium">Deadline:</span> {selectedJob.deadline.toLocaleDateString()}</p>
                        <p><span className="font-medium">Applications:</span> {selectedJob.applicationsCount || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedJob.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Responsibilities</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {selectedJob.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setShowJobModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => openJobModal(selectedJob)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Edit Job
                    </button>
                  </div>
                </div>
              ) : (
                // Edit/Create Mode
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
                        <option value="Digital Health">Digital Health</option>
                        <option value="Health Systems">Health Systems</option>
                        <option value="Health Information Systems">Health Information Systems</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Public Health">Public Health</option>
                        <option value="Communications">Communications</option>
                        <option value="Research & Development">Research & Development</option>
                        <option value="Finance & Administration">Finance & Administration</option>
                        <option value="Clinical Research">Clinical Research</option>
                      </select>
                    </div>
                    
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
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        value={jobForm.type}
                        onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value as 'full-time' | 'part-time' | 'contract' }))}
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salary Range *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., KES 80,000 - 120,000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
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
                          <X className="w-4 h-4" />
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
                          <X className="w-4 h-4" />
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.status}
                      onChange={(e) => setJobForm(prev => ({ ...prev, status: e.target.value as 'active' | 'closed' | 'draft' }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                    </select>
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
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingJob ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {editingJob ? 'Update Job' : 'Create Job'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
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
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedApplication(null);
                  }}
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
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.replace('-', ' ')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Internal Notes</h3>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add internal notes about this application..."
                  defaultValue={selectedApplication.notes}
                />
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedApplication.status}
                  onChange={(e) => handleUpdateApplicationStatus(selectedApplication.id, e.target.value as Application['status'])}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under-review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview-scheduled">Interview Scheduled</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
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