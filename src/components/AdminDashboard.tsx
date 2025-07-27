import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Download, 
  Plus,
  MoreVertical,
  MessageSquare,
  Star,
  AlertCircle,
  LogOut,
  Shield,
  Save,
  Building,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface Application {
  id: string;
  applicantId: string; // This will be the Firebase user UID
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  stage: 'initial-review' | 'technical-review' | 'hr-review' | 'final-review' | 'completed';
  submittedAt: Date;
  lastUpdated: Date;
  coverLetter: string;
  resumeUrl?: string;
  score?: number;
  notes: string;
  reviewedBy?: string;
  interviewDate?: Date;
  createdBy: string; // Firebase user UID who created the application
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
  status: 'active' | 'closed' | 'draft';
  deadline: Date;
  postedAt: Date;
  applicationsCount: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'jobs' | 'analytics'>('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [editingJob, setEditingJob] = useState<Partial<JobListing>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load applications from Firebase
  useEffect(() => {
    loadApplicationsRealTime();
    loadJobs();
  }, []);

  const loadApplicationsRealTime = () => {
    try {
      setLoading(true);
      setError('');
      
      // Set up real-time listener for all applications
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
            interviewDate: data.interviewDate?.toDate()
          } as Application;
        });
        
        // Add demo data for demonstration
        const mockApplications: Application[] = [
          {
            id: 'demo-1',
            applicantId: 'demo-applicant-user',
            applicantName: 'Demo Applicant',
            applicantEmail: 'applicant@email.com',
            applicantPhone: '+254 712 345 678',
            jobId: 'job1',
            jobTitle: 'Health Data Analyst',
            department: 'Data & Analytics',
            status: 'under-review',
            stage: 'technical-review',
            submittedAt: new Date('2024-01-15'),
            lastUpdated: new Date('2024-01-18'),
            coverLetter: 'I am excited to apply for the Health Data Analyst position. With my background in statistics and healthcare data analysis, I believe I can contribute significantly to Kenya\'s digital health transformation.',
            score: 85,
            notes: 'Strong technical background, good communication skills. Recommended for interview.',
            reviewedBy: 'Sarah Johnson',
            createdBy: 'demo-applicant-user'
          },
          {
            id: 'demo-2',
            applicantId: 'demo-applicant-user',
            applicantName: 'Demo Applicant',
            applicantEmail: 'applicant@email.com',
            applicantPhone: '+254 723 456 789',
            jobId: 'job2',
            jobTitle: 'Digital Health Specialist',
            department: 'Digital Health',
            status: 'shortlisted',
            stage: 'hr-review',
            submittedAt: new Date('2024-01-12'),
            lastUpdated: new Date('2024-01-20'),
            coverLetter: 'As a passionate advocate for digital health solutions, I believe I would be an excellent fit for this role. My experience in implementing health technology systems aligns perfectly with DHA\'s mission.',
            score: 92,
            notes: 'Excellent candidate with relevant experience. Schedule interview ASAP.',
            reviewedBy: 'Michael Brown',
            interviewDate: new Date('2024-01-25'),
            createdBy: 'demo-applicant-user'
          }
        ];

        // Combine real applications with demo data
        const allApplications = [...applicationsData, ...mockApplications];
        setApplications(allApplications);
        setLoading(false);
      }, (error) => {
        console.error('Error loading applications:', error);
        setError('Failed to load applications. Please try again.');
        setLoading(false);
      });

      // Return cleanup function
      return unsubscribe;
      
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications. Please try again.');
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      // Mock job data - in real implementation, load from Firebase
      const mockJobs: JobListing[] = [
        {
          id: 'job1',
          title: 'Health Data Analyst',
          department: 'Data & Analytics',
          location: 'Nairobi',
          type: 'full-time',
          salary: 'KES 80,000 - 120,000',
          description: 'We are seeking a skilled Health Data Analyst to join our team and help transform Kenya\'s healthcare system through data-driven insights.',
          requirements: [
            'Bachelor\'s degree in Statistics, Mathematics, Computer Science, or related field',
            'Minimum 2 years of experience in data analysis',
            'Proficiency in SQL, Python, or R'
          ],
          responsibilities: [
            'Analyze healthcare data to identify trends and patterns',
            'Create comprehensive reports and dashboards',
            'Collaborate with healthcare professionals'
          ],
          benefits: [
            'Competitive salary and benefits package',
            'Health insurance coverage',
            'Professional development opportunities'
          ],
          status: 'active',
          deadline: new Date('2024-02-15'),
          postedAt: new Date('2024-01-01'),
          applicationsCount: 12
        },
        {
          id: 'job2',
          title: 'Digital Health Specialist',
          department: 'Digital Health',
          location: 'Kisumu',
          type: 'full-time',
          salary: 'KES 90,000 - 140,000',
          description: 'Join our Digital Health team to lead the implementation of innovative health technology solutions across Kenya.',
          requirements: [
            'Master\'s degree in Public Health, Health Informatics, or related field',
            'Minimum 3 years of experience in digital health',
            'Knowledge of health information systems'
          ],
          responsibilities: [
            'Lead digital health project implementation',
            'Coordinate with healthcare facilities and stakeholders',
            'Provide technical assistance and training'
          ],
          benefits: [
            'Competitive salary and comprehensive benefits',
            'Travel allowances for field work',
            'Professional development and training'
          ],
          status: 'active',
          deadline: new Date('2024-02-20'),
          postedAt: new Date('2024-01-05'),
          applicationsCount: 8
        },
        {
          id: 'job3',
          title: 'Health Systems Coordinator',
          department: 'Health Systems',
          location: 'Mombasa',
          type: 'full-time',
          salary: 'KES 70,000 - 100,000',
          description: 'We are looking for a Health Systems Coordinator to support the strengthening of health systems in coastal Kenya.',
          requirements: [
            'Bachelor\'s degree in Public Health, Medicine, or related field',
            'Minimum 2 years of experience in health systems',
            'Knowledge of Kenyan health system structure'
          ],
          responsibilities: [
            'Coordinate health systems strengthening activities',
            'Support county health teams in planning',
            'Facilitate stakeholder meetings and workshops'
          ],
          benefits: [
            'Competitive salary package',
            'Health insurance for employee and family',
            'Transportation allowance'
          ],
          status: 'closed',
          deadline: new Date('2024-02-10'),
          postedAt: new Date('2023-12-20'),
          applicationsCount: 15
        }
      ];

      setJobs(mockJobs);
      
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
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

  const getStageColor = (stage: Application['stage']) => {
    switch (stage) {
      case 'initial-review': return 'bg-blue-50 text-blue-700';
      case 'technical-review': return 'bg-orange-50 text-orange-700';
      case 'hr-review': return 'bg-purple-50 text-purple-700';
      case 'final-review': return 'bg-indigo-50 text-indigo-700';
      case 'completed': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: Application['status']) => {
    try {
      // Update local state immediately for better UX
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              status: newStatus, 
              lastUpdated: new Date(), 
              reviewedBy: userProfile?.displayName || 'Admin'
            }
          : app
      ));

      // Update Firebase (skip for demo applications)
      if (!applicationId.startsWith('demo-')) {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          status: newStatus,
          lastUpdated: serverTimestamp(),
          reviewedBy: userProfile?.displayName || currentUser?.uid
        });
      }
      
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Failed to update application status. Please try again.');
    }
  };

  const handleStageChange = async (applicationId: string, newStage: Application['stage']) => {
    try {
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              stage: newStage, 
              lastUpdated: new Date(), 
              reviewedBy: userProfile?.displayName || 'Admin'
            }
          : app
      ));

      // Update Firebase (skip for demo applications)
      if (!applicationId.startsWith('demo-')) {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          stage: newStage,
          lastUpdated: serverTimestamp(),
          reviewedBy: userProfile?.displayName || currentUser?.uid
        });
      }
      
    } catch (error) {
      console.error('Error updating application stage:', error);
      setError('Failed to update application stage. Please try again.');
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      // Update local state immediately
      setApplications(prev => prev.filter(app => app.id !== applicationId));

      // Delete from Firebase (skip for demo applications)
      if (!applicationId.startsWith('demo-')) {
        await deleteDoc(doc(db, 'applications', applicationId));
      }
      
    } catch (error) {
      console.error('Error deleting application:', error);
      setError('Failed to delete application. Please try again.');
    }
  };

  const handleUpdateNotes = async (applicationId: string, notes: string) => {
    try {
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              notes, 
              lastUpdated: new Date(), 
              reviewedBy: userProfile?.displayName || 'Admin'
            }
          : app
      ));

      // Update Firebase (skip for demo applications)
      if (!applicationId.startsWith('demo-')) {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          notes,
          lastUpdated: serverTimestamp(),
          reviewedBy: userProfile?.displayName || currentUser?.uid
        });
      }
      
    } catch (error) {
      console.error('Error updating notes:', error);
      setError('Failed to update notes. Please try again.');
    }
  };

  const handleScoreUpdate = async (applicationId: string, score: number) => {
    try {
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              score, 
              lastUpdated: new Date(), 
              reviewedBy: userProfile?.displayName || 'Admin'
            }
          : app
      ));

      // Update Firebase (skip for demo applications)
      if (!applicationId.startsWith('demo-')) {
        const applicationRef = doc(db, 'applications', applicationId);
        await updateDoc(applicationRef, {
          score,
          lastUpdated: serverTimestamp(),
          reviewedBy: userProfile?.displayName || currentUser?.uid
        });
      }
      
    } catch (error) {
      console.error('Error updating score:', error);
      setError('Failed to update score. Please try again.');
    }
  };

  const handleCreateJob = async () => {
    try {
      const newJob: Omit<JobListing, 'id' | 'applicationsCount'> = {
        title: editingJob.title || '',
        department: editingJob.department || '',
        location: editingJob.location || '',
        type: editingJob.type || 'full-time',
        salary: editingJob.salary || '',
        description: editingJob.description || '',
        requirements: editingJob.requirements || [],
        responsibilities: editingJob.responsibilities || [],
        benefits: editingJob.benefits || [],
        status: editingJob.status || 'draft',
        deadline: editingJob.deadline || new Date(),
        postedAt: new Date()
      };

      // In real implementation, save to Firebase
      const jobId = `job-${Date.now()}`;
      const jobWithId = { ...newJob, id: jobId, applicationsCount: 0 };
      
      setJobs(prev => [jobWithId, ...prev]);
      setShowCreateJobModal(false);
      setEditingJob({});
      
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    }
  };

  const handleUpdateJob = async (jobId: string) => {
    try {
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, ...editingJob }
          : job
      ));
      
      setShowJobModal(false);
      setEditingJob({});
      
    } catch (error) {
      console.error('Error updating job:', error);
      setError('Failed to update job. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleBulkStatusUpdate = async (applicationIds: string[], newStatus: Application['status']) => {
    try {
      setApplications(prev => prev.map(app => 
        applicationIds.includes(app.id)
          ? { 
              ...app, 
              status: newStatus, 
              lastUpdated: new Date(), 
              reviewedBy: userProfile?.displayName || 'Admin'
            }
          : app
      ));
      
    } catch (error) {
      console.error('Error updating applications:', error);
      setError('Failed to update applications. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
    const matchesDepartment = departmentFilter === 'all' || app.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesStage && matchesDepartment;
  });

  const getOverviewStats = () => {
    const totalApplications = applications.length;
    const pendingReview = applications.filter(app => app.status === 'submitted' || app.status === 'under-review').length;
    const shortlisted = applications.filter(app => app.status === 'shortlisted').length;
    const hired = applications.filter(app => app.status === 'hired').length;
    
    return { totalApplications, pendingReview, shortlisted, hired };
  };

  const stats = getOverviewStats();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
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
              <span className="text-sm text-gray-600">Welcome, {userProfile?.displayName}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {userProfile?.role === 'admin' ? 'Administrator' : 'HR Staff'}
              </span>
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
        {/* Error Message */}
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
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Job Listings ({jobs.length})
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.shortlisted}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hired</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.slice(0, 5).map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              {application.applicantId === 'demo-applicant-user' ? (
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <User className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                              <div className="text-xs text-gray-400">ID: {application.applicantId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.jobTitle}</div>
                          <div className="text-sm text-gray-500">{application.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                            {application.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(application.stage)}`}>
                            {application.stage.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {application.score ? `${application.score}/100` : 'Not scored'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="initial-review">Initial Review</option>
                  <option value="technical-review">Technical Review</option>
                  <option value="hr-review">HR Review</option>
                  <option value="final-review">Final Review</option>
                  <option value="completed">Completed</option>
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
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Applications ({filteredApplications.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
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
                        Stage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
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
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              {application.applicantId === 'demo-applicant-user' ? (
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <User className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                              <div className="text-xs text-gray-400">User ID: {application.applicantId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.jobTitle}</div>
                          <div className="text-sm text-gray-500">{application.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(application.status)}`}
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value as Application['status'])}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="under-review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview-scheduled">Interview Scheduled</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStageColor(application.stage)}`}
                            value={application.stage}
                            onChange={(e) => handleStageChange(application.id, e.target.value as Application['stage'])}
                          >
                            <option value="initial-review">Initial Review</option>
                            <option value="technical-review">Technical Review</option>
                            <option value="hr-review">HR Review</option>
                            <option value="final-review">Final Review</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                            value={application.score || ''}
                            onChange={(e) => handleScoreUpdate(application.id, parseInt(e.target.value) || 0)}
                            placeholder="0-100"
                          />
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
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteApplication(application.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
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

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
              <button 
                onClick={() => {
                  setEditingJob({
                    title: '',
                    department: '',
                    location: '',
                    type: 'full-time',
                    salary: '',
                    description: '',
                    requirements: [],
                    responsibilities: [],
                    benefits: [],
                    status: 'draft',
                    deadline: new Date()
                  });
                  setShowCreateJobModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Job
              </button>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline: {job.deadline.toLocaleDateString()}
                        </div>
                      </div>
                      {job.description && (
                        <p className="text-gray-700 mt-3 line-clamp-2">{job.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
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
                      {job.applicationsCount} applications received
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setEditingJob(job);
                          setShowJobModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="View/Edit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedJob(job);
                          setEditingJob(job);
                          setShowJobModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      acc[app.status] = (acc[app.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize text-gray-700">{status.replace('-', ' ')}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(count / applications.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Department Applications</h3>
                <div className="space-y-3">
                  {Object.entries(
                    applications.reduce((acc, app) => {
                      acc[app.department] = (acc[app.department] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([department, count]) => (
                    <div key={department} className="flex justify-between items-center">
                      <span className="text-gray-700">{department}</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(count / applications.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Applicant Information</h3>
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Account Details</div>
                    <div className="text-xs text-gray-500">User ID: {selectedApplication.applicantId}</div>
                    <div className="text-xs text-gray-500">Created by: {selectedApplication.createdBy}</div>
                    {selectedApplication.applicantId === 'demo-applicant-user' && (
                      <div className="text-xs text-green-600 font-medium">✓ Verified Demo Account</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedApplication.applicantName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedApplication.applicantEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{selectedApplication.applicantPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Application Status</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Stage:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(selectedApplication.stage)}`}>
                        {selectedApplication.stage.replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Score:</span>
                      <span className="ml-2 text-gray-700">{selectedApplication.score || 'Not scored'}/100</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <span className="ml-2 text-gray-700">{selectedApplication.lastUpdated.toLocaleDateString()}</span>
                    </div>
                    {selectedApplication.reviewedBy && (
                      <div>
                        <span className="text-sm text-gray-500">Reviewed by:</span>
                        <span className="ml-2 text-gray-700">{selectedApplication.reviewedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Review Notes</h3>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedApplication.notes}
                  onChange={(e) => handleUpdateNotes(selectedApplication.id, e.target.value)}
                  placeholder="Add review notes..."
                />
                {selectedApplication.reviewedBy && (
                  <p className="text-sm text-gray-500 mt-2">
                    Last reviewed by: {selectedApplication.reviewedBy}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Details/Edit Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Edit Job: {selectedJob.title}</h2>
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setEditingJob({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.title || ''}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.department || ''}
                    onChange={(e) => setEditingJob({...editingJob, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Digital Health">Digital Health</option>
                    <option value="Health Systems">Health Systems</option>
                    <option value="Health Information Systems">Health Information Systems</option>
                    <option value="Public Health">Public Health</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Communications">Communications</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Finance & Administration">Finance & Administration</option>
                    <option value="Clinical Research">Clinical Research</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.location || ''}
                    onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                    placeholder="e.g., Nairobi, Kisumu, Mombasa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.type || 'full-time'}
                    onChange={(e) => setEditingJob({...editingJob, type: e.target.value as 'full-time' | 'part-time' | 'contract'})}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.salary || ''}
                    onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                    placeholder="e.g., KES 80,000 - 120,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.status || 'draft'}
                    onChange={(e) => setEditingJob({...editingJob, status: e.target.value as 'active' | 'closed' | 'draft'})}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.deadline ? editingJob.deadline.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingJob({...editingJob, deadline: new Date(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  placeholder="Describe the role and what the candidate will be doing..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.requirements?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                  placeholder="Enter each requirement on a new line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.responsibilities?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, responsibilities: e.target.value.split('\n').filter(r => r.trim())})}
                  placeholder="Enter each responsibility on a new line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.benefits?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, benefits: e.target.value.split('\n').filter(b => b.trim())})}
                  placeholder="Enter each benefit on a new line..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowJobModal(false);
                    setEditingJob({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateJob(selectedJob.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
                <button
                  onClick={() => {
                    setShowCreateJobModal(false);
                    setEditingJob({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.title || ''}
                    onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                    placeholder="e.g., Health Data Analyst"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.department || ''}
                    onChange={(e) => setEditingJob({...editingJob, department: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    <option value="Data & Analytics">Data & Analytics</option>
                    <option value="Digital Health">Digital Health</option>
                    <option value="Health Systems">Health Systems</option>
                    <option value="Health Information Systems">Health Information Systems</option>
                    <option value="Public Health">Public Health</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Communications">Communications</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Finance & Administration">Finance & Administration</option>
                    <option value="Clinical Research">Clinical Research</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.location || ''}
                    onChange={(e) => setEditingJob({...editingJob, location: e.target.value})}
                    placeholder="e.g., Nairobi, Kisumu, Mombasa"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.type || 'full-time'}
                    onChange={(e) => setEditingJob({...editingJob, type: e.target.value as 'full-time' | 'part-time' | 'contract'})}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.salary || ''}
                    onChange={(e) => setEditingJob({...editingJob, salary: e.target.value})}
                    placeholder="e.g., KES 80,000 - 120,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={editingJob.deadline ? editingJob.deadline.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditingJob({...editingJob, deadline: new Date(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  placeholder="Describe the role and what the candidate will be doing..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.requirements?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, requirements: e.target.value.split('\n').filter(r => r.trim())})}
                  placeholder="Enter each requirement on a new line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.responsibilities?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, responsibilities: e.target.value.split('\n').filter(r => r.trim())})}
                  placeholder="Enter each responsibility on a new line..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={editingJob.benefits?.join('\n') || ''}
                  onChange={(e) => setEditingJob({...editingJob, benefits: e.target.value.split('\n').filter(b => b.trim())})}
                  placeholder="Enter each benefit on a new line..."
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowCreateJobModal(false);
                    setEditingJob({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateJob}
                  disabled={!editingJob.title || !editingJob.department || !editingJob.location || !editingJob.description}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
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