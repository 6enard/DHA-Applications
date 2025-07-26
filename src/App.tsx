import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  Globe, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Heart, 
  Building, 
  LogOut, 
  User, 
  ChevronRight,
  Home,
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import Register from './components/Register';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  level: string;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary: string;
  status: 'active' | 'closed' | 'draft';
  applicantCount: number;
  postedDate: string;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  phone: string;
  experience: string;
  education: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  submittedDate: string;
  documents: string[];
  coverLetter?: string;
}

const translations = {
  en: {
    title: 'Digital Health Agency - Job Portal',
    nav: {
      home: 'Home',
      jobs: 'Jobs',
      applications: 'Applications',
      dashboard: 'Dashboard',
      profile: 'Profile',
      login: 'Sign In',
      register: 'Sign Up',
      logout: 'Sign Out',
      backToHome: 'Back to Home'
    },
    hero: {
      title: 'Build Kenya\'s Digital Health Future',
      subtitle: 'Join the Digital Health Agency and make a difference in healthcare technology across Kenya',
      searchPlaceholder: 'Search for jobs...',
      searchButton: 'Search Jobs'
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
      signInHere: 'Sign in here',
      signUpHere: 'Sign up here',
      getStarted: 'Get Started'
    },
    jobs: {
      title: 'Available Positions',
      filter: 'Filter Jobs',
      department: 'Department',
      location: 'Location',
      type: 'Job Type',
      level: 'Experience Level',
      apply: 'Apply Now',
      viewDetails: 'View Details',
      deadline: 'Application Deadline',
      applicants: 'applicants',
      postedOn: 'Posted on'
    },
    application: {
      title: 'Job Application',
      personalInfo: 'Personal Information',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      experience: 'Years of Experience',
      education: 'Highest Education Level',
      documents: 'Upload Documents',
      submit: 'Submit Application',
      success: 'Application submitted successfully!',
      error: 'Please fill in all required fields'
    },
    dashboard: {
      title: 'Admin Dashboard',
      stats: {
        totalJobs: 'Total Jobs',
        activeJobs: 'Active Jobs',
        totalApplications: 'Total Applications',
        pendingReview: 'Pending Review'
      },
      manageJobs: 'Manage Jobs',
      manageApplications: 'Manage Applications',
      addJob: 'Add New Job',
      viewApplications: 'View Applications'
    }
  },
  sw: {
    title: 'Wakala wa Afya ya Kidijitali - Tovuti ya Kazi',
    nav: {
      home: 'Nyumbani',
      jobs: 'Kazi',
      applications: 'Maombi',
      dashboard: 'Dashibodi',
      profile: 'Wasifu',
      login: 'Ingia',
      register: 'Jisajili',
      logout: 'Toka',
      backToHome: 'Rudi Nyumbani'
    },
    hero: {
      title: 'Jenga Mustakabali wa Afya ya Kidijitali Kenya',
      subtitle: 'Jiunge na Wakala wa Afya ya Kidijitali na ulete mabadiliko katika teknolojia ya afya nchini Kenya',
      searchPlaceholder: 'Tafuta kazi...',
      searchButton: 'Tafuta Kazi'
    },
    auth: {
      signIn: 'Ingia',
      signUp: 'Jisajili',
      alreadyHaveAccount: 'Una akaunti tayari?',
      dontHaveAccount: 'Huna akaunti?',
      signInHere: 'Ingia hapa',
      signUpHere: 'Jisajili hapa',
      getStarted: 'Anza'
    },
    jobs: {
      title: 'Nafasi Zinazopatikana',
      filter: 'Chuja Kazi',
      department: 'Idara',
      location: 'Mahali',
      type: 'Aina ya Kazi',
      level: 'Kiwango cha Uzoefu',
      apply: 'Omba Sasa',
      viewDetails: 'Angalia Maelezo',
      deadline: 'Tarehe ya Mwisho ya Maombi',
      applicants: 'waombaji',
      postedOn: 'Ilichapishwa'
    },
    application: {
      title: 'Ombi la Kazi',
      personalInfo: 'Taarifa za Kibinafsi',
      name: 'Jina Kamili',
      email: 'Anwani ya Barua Pepe',
      phone: 'Nambari ya Simu',
      experience: 'Miaka ya Uzoefu',
      education: 'Kiwango cha Juu cha Elimu',
      documents: 'Pakia Hati',
      submit: 'Wasilisha Ombi',
      success: 'Ombi limewasilishwa kwa ufanisi!',
      error: 'Tafadhali jaza sehemu zote zinazohitajika'
    },
    dashboard: {
      title: 'Dashibodi ya Msimamizi',
      stats: {
        totalJobs: 'Jumla ya Kazi',
        activeJobs: 'Kazi Zinazoendelea',
        totalApplications: 'Jumla ya Maombi',
        pendingReview: 'Inasubiri Ukaguzi'
      },
      manageJobs: 'Simamia Kazi',
      manageApplications: 'Simamia Maombi',
      addJob: 'Ongeza Kazi Mpya',
      viewApplications: 'Angalia Maombi'
    }
  }
};

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Health IT Specialist',
    department: 'Information Technology',
    location: 'Nairobi',
    type: 'Full-time',
    level: 'Senior',
    deadline: '2025-02-15',
    description: 'Lead digital health initiatives and manage IT infrastructure for health systems across Kenya.',
    requirements: ['Bachelor\'s degree in IT or related field', '5+ years experience in health IT', 'Knowledge of health information systems'],
    responsibilities: ['Develop digital health strategies', 'Manage IT projects', 'Collaborate with healthcare providers'],
    salary: 'KES 120,000 - 180,000',
    status: 'active',
    applicantCount: 23,
    postedDate: '2025-01-15'
  },
  {
    id: '2',
    title: 'Data Analyst - Health Analytics',
    department: 'Data & Analytics',
    location: 'Mombasa',
    type: 'Full-time',
    level: 'Mid-level',
    deadline: '2025-02-20',
    description: 'Analyze health data to support evidence-based decision making in Kenya\'s health sector.',
    requirements: ['Bachelor\'s degree in Statistics, Data Science, or related field', '3+ years experience in data analysis', 'Proficiency in R/Python'],
    responsibilities: ['Analyze health data trends', 'Create data visualizations', 'Support policy development'],
    salary: 'KES 80,000 - 120,000',
    status: 'active',
    applicantCount: 15,
    postedDate: '2025-01-10'
  },
  {
    id: '3',
    title: 'Digital Health Program Manager',
    department: 'Program Management',
    location: 'Kisumu',
    type: 'Full-time',
    level: 'Senior',
    deadline: '2025-02-25',
    description: 'Oversee implementation of digital health programs in Western Kenya region.',
    requirements: ['Master\'s degree in Public Health or related field', '7+ years program management experience', 'Knowledge of health systems'],
    responsibilities: ['Manage program implementation', 'Coordinate with stakeholders', 'Monitor program outcomes'],
    salary: 'KES 150,000 - 200,000',
    status: 'active',
    applicantCount: 8,
    postedDate: '2025-01-12'
  },
  {
    id: '4',
    title: 'Health Systems Analyst',
    department: 'Health Systems',
    location: 'Eldoret',
    type: 'Full-time',
    level: 'Mid-level',
    deadline: '2025-02-18',
    description: 'Analyze and optimize health system processes to improve efficiency and patient outcomes.',
    requirements: ['Bachelor\'s degree in Health Informatics or related field', '4+ years experience in health systems', 'Strong analytical skills'],
    responsibilities: ['Conduct system analysis', 'Develop process improvements', 'Create documentation'],
    salary: 'KES 90,000 - 130,000',
    status: 'active',
    applicantCount: 12,
    postedDate: '2025-01-08'
  }
];

const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Health IT Specialist',
    applicantName: 'John Kamau',
    applicantEmail: 'john.kamau@email.com',
    phone: '+254712345678',
    experience: '6 years',
    education: 'Bachelor\'s in Computer Science',
    status: 'pending',
    submittedDate: '2025-01-16',
    documents: ['Resume.pdf', 'Cover Letter.pdf', 'Certificates.pdf'],
    coverLetter: 'I am passionate about digital health and have extensive experience in health IT systems...'
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Data Analyst - Health Analytics',
    applicantName: 'Mary Wanjiku',
    applicantEmail: 'mary.wanjiku@email.com',
    phone: '+254723456789',
    experience: '4 years',
    education: 'Master\'s in Statistics',
    status: 'reviewed',
    submittedDate: '2025-01-14',
    documents: ['Resume.pdf', 'Portfolio.pdf'],
    coverLetter: 'With my background in statistics and passion for healthcare data analysis...'
  },
  {
    id: '3',
    jobId: '3',
    jobTitle: 'Digital Health Program Manager',
    applicantName: 'Peter Ochieng',
    applicantEmail: 'peter.ochieng@email.com',
    phone: '+254734567890',
    experience: '8 years',
    education: 'MBA in Healthcare Management',
    status: 'shortlisted',
    submittedDate: '2025-01-13',
    documents: ['Resume.pdf', 'References.pdf'],
    coverLetter: 'I have successfully managed multiple digital health programs across East Africa...'
  },
  {
    id: '4',
    jobId: '1',
    jobTitle: 'Senior Health IT Specialist',
    applicantName: 'Grace Nyong\'o',
    applicantEmail: 'grace.nyongo@email.com',
    phone: '+254745678901',
    experience: '5 years',
    education: 'Bachelor\'s in Information Systems',
    status: 'rejected',
    submittedDate: '2025-01-12',
    documents: ['Resume.pdf'],
    coverLetter: 'I am eager to contribute to Kenya\'s digital health transformation...'
  },
  {
    id: '5',
    jobId: '4',
    jobTitle: 'Health Systems Analyst',
    applicantName: 'David Kiprop',
    applicantEmail: 'david.kiprop@email.com',
    phone: '+254756789012',
    experience: '3 years',
    education: 'Bachelor\'s in Health Informatics',
    status: 'pending',
    submittedDate: '2025-01-15',
    documents: ['Resume.pdf', 'Transcripts.pdf'],
    coverLetter: 'My experience in health informatics and system analysis makes me a perfect fit...'
  }
];

const AppContent: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    type: '',
    level: ''
  });
  const [applicationForm, setApplicationForm] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    coverLetter: '',
    documents: [] as string[]
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Admin dashboard states
  const [adminFilters, setAdminFilters] = useState({
    status: 'all',
    department: 'all',
    dateRange: 'all'
  });
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'position'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const t = translations[language];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filters.department || job.department === filters.department;
    const matchesLocation = !filters.location || job.location === filters.location;
    const matchesType = !filters.type || job.type === filters.type;
    const matchesLevel = !filters.level || job.level === filters.level;
    
    return matchesSearch && matchesDepartment && matchesLocation && matchesType && matchesLevel;
  });

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                         app.applicantEmail.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                         app.jobTitle.toLowerCase().includes(adminSearchTerm.toLowerCase());
    const matchesStatus = adminFilters.status === 'all' || app.status === adminFilters.status;
    const matchesDepartment = adminFilters.department === 'all' || 
                             jobs.find(job => job.id === app.jobId)?.department === adminFilters.department;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
        break;
      case 'name':
        comparison = a.applicantName.localeCompare(b.applicantName);
        break;
      case 'position':
        comparison = a.jobTitle.localeCompare(b.jobTitle);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApplicationSubmit = async () => {
    if (!applicationForm.name || !applicationForm.email || !applicationForm.phone || !selectedJob) {
      showNotification('error', t.application.error);
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      applicantName: applicationForm.name,
      applicantEmail: applicationForm.email,
      phone: applicationForm.phone,
      experience: applicationForm.experience,
      education: applicationForm.education,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      documents: applicationForm.documents,
      coverLetter: applicationForm.coverLetter
    };

    setApplications([...applications, newApplication]);
    
    // Update job applicant count
    setJobs(jobs.map(job => 
      job.id === selectedJob.id 
        ? { ...job, applicantCount: job.applicantCount + 1 }
        : job
    ));

    showNotification('success', t.application.success);
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      experience: '',
      education: '',
      coverLetter: '',
      documents: []
    });
    setSelectedJob(null);
    setCurrentPage('jobs');
    setLoading(false);
  };

  const updateApplicationStatus = (applicationId: string, newStatus: Application['status']) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
    showNotification('success', `Application status updated to ${newStatus}`);
  };

  const exportApplications = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Position', 'Status', 'Submitted Date', 'Experience', 'Education'],
      ...filteredApplications.map(app => [
        app.applicantName,
        app.applicantEmail,
        app.phone,
        app.jobTitle,
        app.status,
        app.submittedDate,
        app.experience,
        app.education
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'applications.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('success', 'Applications exported successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'reviewed': return 'text-blue-600 bg-blue-100';
      case 'shortlisted': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'accepted': return 'text-green-800 bg-green-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      case 'shortlisted': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
      showNotification('success', 'Signed out successfully');
    } catch (error) {
      console.error('Failed to log out:', error);
      showNotification('error', 'Failed to sign out');
    }
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setSelectedJob(null);
    setSelectedApplication(null);
  };

  // Check if current user is admin
  const isAdmin = currentUser && (userProfile?.role === 'hr' || currentUser.email === 'hr@dha.go.ke');

  // If user is admin, show admin dashboard
  if (isAdmin && currentPage === 'dashboard') {
    return renderAdminDashboard();
  }

  const renderAuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">{t.nav.backToHome}</span>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {authMode === 'login' ? (
              <Login 
                onToggleMode={() => setAuthMode('register')}
                onClose={() => setShowAuthModal(false)}
              />
            ) : (
              <Register 
                onToggleMode={() => setAuthMode('login')}
                onClose={() => setShowAuthModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBreadcrumb = () => {
    const breadcrumbItems = [];
    
    switch (currentPage) {
      case 'jobs':
        breadcrumbItems.push({ label: t.nav.home, onClick: navigateToHome });
        breadcrumbItems.push({ label: t.nav.jobs });
        break;
      case 'jobDetail':
        breadcrumbItems.push({ label: t.nav.home, onClick: navigateToHome });
        breadcrumbItems.push({ label: t.nav.jobs, onClick: () => setCurrentPage('jobs') });
        breadcrumbItems.push({ label: selectedJob?.title || 'Job Details' });
        break;
      case 'apply':
        breadcrumbItems.push({ label: t.nav.home, onClick: navigateToHome });
        breadcrumbItems.push({ label: t.nav.jobs, onClick: () => setCurrentPage('jobs') });
        breadcrumbItems.push({ label: selectedJob?.title || 'Job', onClick: () => setCurrentPage('jobDetail') });
        breadcrumbItems.push({ label: 'Apply' });
        break;
      case 'dashboard':
        breadcrumbItems.push({ label: t.nav.home, onClick: navigateToHome });
        breadcrumbItems.push({ label: t.dashboard.title });
        break;
      case 'about':
        breadcrumbItems.push({ label: t.nav.home, onClick: navigateToHome });
        breadcrumbItems.push({ label: 'About' });
        break;
    }

    if (breadcrumbItems.length <= 1) return null;

    return (
      <nav className="bg-gray-50 border-b px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />}
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-gray-600">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    );
  };

  const renderHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={navigateToHome} className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">DHA</h1>
                <p className="text-xs text-gray-600">Digital Health Agency</p>
              </div>
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={navigateToHome}
              className={`${
                currentPage === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => setCurrentPage('jobs')}
              className={`${
                currentPage === 'jobs' || currentPage === 'jobDetail' || currentPage === 'apply' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              {t.nav.jobs}
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`${
                currentPage === 'about' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              About
            </button>
            {isAdmin && (
              <button
                onClick={() => setCurrentPage('dashboard')}
                className={`${
                  currentPage === 'dashboard' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {t.dashboard.title}
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'SW' : 'EN'}</span>
            </button>

            <div className="hidden md:flex items-center space-x-6">
              {currentUser ? (
                <>
                  <button className="text-gray-600 hover:text-green-600 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      3
                    </span>
                  </button>
                  <div className="relative">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
                      <User className="w-5 h-5" />
                      <span className="text-sm font-medium">{userProfile?.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                      {isAdmin && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Admin</span>
                      )}
                    </button>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {setAuthMode('login'); setShowAuthModal(true);}}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {t.auth.signIn}
                  </button>
                  <button
                    onClick={() => {setAuthMode('register'); setShowAuthModal(true);}}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t.auth.getStarted}
                  </button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => {navigateToHome(); setIsMenuOpen(false);}}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
              >
                {t.nav.home}
              </button>
              <button
                onClick={() => {setCurrentPage('jobs'); setIsMenuOpen(false);}}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
              >
                {t.nav.jobs}
              </button>
              <button
                onClick={() => {setCurrentPage('about'); setIsMenuOpen(false);}}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
              >
                About
              </button>
              {isAdmin && (
                <button
                  onClick={() => {setCurrentPage('dashboard'); setIsMenuOpen(false);}}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
                >
                  {t.dashboard.title}
                </button>
              )}
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500 border-t">
                    Signed in as: {userProfile?.displayName || currentUser.email}
                    {isAdmin && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Admin</span>}
                  </div>
                  <button
                    onClick={() => {handleLogout(); setIsMenuOpen(false);}}
                    className="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md w-full text-left"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {setAuthMode('login'); setShowAuthModal(true); setIsMenuOpen(false);}}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {t.auth.signIn}
                  </button>
                  <button
                    onClick={() => {setAuthMode('register'); setShowAuthModal(true); setIsMenuOpen(false);}}
                    className="block px-3 py-2 text-base font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {t.auth.getStarted}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const renderAdminDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
              <p className="text-gray-600">Digital Health Agency - Kenya</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportApplications}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.dashboard.stats.totalJobs}</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.dashboard.stats.activeJobs}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(job => job.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.dashboard.stats.totalApplications}</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t.dashboard.stats.pendingReview}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={adminFilters.status}
                  onChange={(e) => setAdminFilters({...adminFilters, status: e.target.value})}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={adminFilters.department}
                  onChange={(e) => setAdminFilters({...adminFilters, department: e.target.value})}
                >
                  <option value="all">All Departments</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Program Management">Program Management</option>
                  <option value="Health Systems">Health Systems</option>
                </select>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'position')}
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="position">Position</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
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
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.applicantName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.applicantEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.jobTitle}</div>
                      <div className="text-sm text-gray-500">
                        {jobs.find(job => job.id === application.jobId)?.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.submittedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          value={application.status}
                          onChange={(e) => updateApplicationStatus(application.id, e.target.value as Application['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                          <option value="accepted">Accepted</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{selectedApplication.applicantName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{selectedApplication.applicantEmail}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span>{selectedApplication.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Position:</span>
                      <p className="text-gray-600">{selectedApplication.jobTitle}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-1 capitalize">{selectedApplication.status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Applied:</span>
                      <p className="text-gray-600">{new Date(selectedApplication.submittedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Professional Background</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <GraduationCap className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium">Education</span>
                    </div>
                    <p className="text-gray-600 ml-7">{selectedApplication.education}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="font-medium">Experience</span>
                    </div>
                    <p className="text-gray-600 ml-7">{selectedApplication.experience}</p>
                  </div>
                </div>
              </div>
              
              {selectedApplication.coverLetter && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium">{doc}</span>
                      </div>
                      <button className="text-green-600 hover:text-green-700 text-sm">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <select
                  value={selectedApplication.status}
                  onChange={(e) => {
                    updateApplicationStatus(selectedApplication.id, e.target.value as Application['status']);
                    setSelectedApplication({...selectedApplication, status: e.target.value as Application['status']});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Send Email
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHero = () => (
    <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-800 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <button
                onClick={() => setCurrentPage('jobs')}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                {t.hero.searchButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{jobs.length}+</div>
            <div className="text-gray-600">
              {language === 'en' ? 'Open Positions' : 'Nafasi Wazi'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{applications.length}+</div>
            <div className="text-gray-600">
              {language === 'en' ? 'Applications' : 'Maombi'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">15</div>
            <div className="text-gray-600">
              {language === 'en' ? 'Departments' : 'Idara'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">47</div>
            <div className="text-gray-600">
              {language === 'en' ? 'Counties Served' : 'Kaunti Zinazotumikiwa'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFeaturedJobs = () => (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Featured Opportunities' : 'Fursa Maalum'}
          </h2>
          <p className="text-xl text-gray-600">
            {language === 'en' 
              ? 'Discover exciting career opportunities in digital health'
              : 'Gundua fursa za kazi za kusisimua katika afya ya kidijitali'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.slice(0, 6).map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-gray-600 text-sm">{job.department}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  {job.level}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {job.deadline}
                </div>
              </div>
              
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{job.applicantCount} applicants</span>
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setCurrentPage('jobDetail');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {t.jobs.viewDetails}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => setCurrentPage('jobs')}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {language === 'en' ? 'View All Jobs' : 'Angalia Kazi Zote'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderJobsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.jobs.title}
          </h1>
          
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={language === 'en' ? "Search jobs..." : "Tafuta kazi..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{language === 'en' ? 'All Departments' : 'Idara Zote'}</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data & Analytics">Data & Analytics</option>
                <option value="Program Management">Program Management</option>
                <option value="Health Systems">Health Systems</option>
              </select>
              
              <select
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{language === 'en' ? 'All Locations' : 'Maeneo Yote'}</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
                <option value="Eldoret">Eldoret</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {job.level}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {job.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Deadline: {job.deadline}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{job.salary}</span>
                    <span>•</span>
                    <span>{job.applicantCount} applicants</span>
                    <span>•</span>
                    <span>Posted {job.postedDate}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setCurrentPage('jobDetail');
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {t.jobs.viewDetails}
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setCurrentPage('apply');
                      }}
                      className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
                    >
                      {t.jobs.apply}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderJobDetail = () => {
    if (!selectedJob) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{selectedJob.title}</h1>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedJob.level}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {selectedJob.department}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {selectedJob.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Deadline: {selectedJob.deadline}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {selectedJob.applicantCount} applicants
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {currentUser ? (
                  <button
                    onClick={() => setCurrentPage('apply')}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {t.jobs.apply}
                  </button>
                ) : (
                  <button
                    onClick={() => {setAuthMode('register'); setShowAuthModal(true);}}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {language === 'en' ? 'Sign Up to Apply' : 'Jisajili ili Kuomba'}
                  </button>
                )}
                <span className="text-lg font-semibold text-gray-900">{selectedJob.salary}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {language === 'en' ? 'Job Description' : 'Maelezo ya Kazi'}
                </h2>
                <p className="text-gray-700 mb-6">{selectedJob.description}</p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Key Responsibilities' : 'Majukumu Makuu'}
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {selectedJob.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      {responsibility}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Requirements' : 'Mahitaji'}
                </h3>
                <ul className="space-y-2 text-gray-700 mb-6">
                  {selectedJob.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      {requirement}
                    </li>
                  ))}
                </ul>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {language === 'en' ? 'Application Information' : 'Taarifa za Maombi'}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Posted: {selectedJob.postedDate}</div>
                    <div>Deadline: {selectedJob.deadline}</div>
                    <div>Job Type: {selectedJob.type}</div>
                    <div>Location: {selectedJob.location}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApplicationForm = () => {
    if (!selectedJob) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.application.title}</h1>
              <p className="text-gray-600">Applying for: <span className="font-semibold">{selectedJob.title}</span></p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleApplicationSubmit(); }} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t.application.personalInfo}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.application.name} *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.name}
                      onChange={(e) => setApplicationForm({...applicationForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.application.email} *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.application.phone} *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.phone}
                      onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.application.experience}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.experience}
                      onChange={(e) => setApplicationForm({...applicationForm, experience: e.target.value})}
                      placeholder="e.g., 3 years"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.application.education}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={applicationForm.education}
                    onChange={(e) => setApplicationForm({...applicationForm, education: e.target.value})}
                    placeholder="e.g., Bachelor's in Computer Science"
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm({...applicationForm, coverLetter: e.target.value})}
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.application.documents}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <button
                        type="button"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Upload Files
                      </button>
                      <p className="mt-2 text-sm text-gray-500">
                        Upload your resume, cover letter, and other relevant documents
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setCurrentPage('jobDetail')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {loading ? 'Submitting...' : t.application.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderAboutPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {language === 'en' ? 'About Digital Health Agency' : 'Kuhusu Wakala wa Afya ya Kidijitali'}
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              {language === 'en' 
                ? "The Digital Health Agency (DHA) is Kenya's premier organization dedicated to transforming healthcare through innovative digital solutions. We work to improve health outcomes for all Kenyans by leveraging technology, data, and digital platforms."
                : "Wakala wa Afya ya Kidijitali (DHA) ni shirika kuu la Kenya linalojitoa kubadilisha huduma za afya kupitia suluhisho za kidijitali za ubunifu. Tunafanya kazi kuboresha matokeo ya afya kwa Wakenya wote kwa kutumia teknolojia, data, na majukwaa ya kidijitali."
              }
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Our Mission' : 'Dhamira Yetu'}
            </h2>
            <p className="text-gray-700 mb-6">
              {language === 'en'
                ? "To lead Kenya's digital health transformation by developing, implementing, and maintaining innovative health information systems that improve healthcare delivery, enhance patient outcomes, and strengthen health system performance."
                : "Kuongoza mabadiliko ya afya ya kidijitali nchini Kenya kwa kuendeleza, kutekeleza, na kudumisha mifumo ya taarifa za afya ya ubunifu ambayo huboresha utoaji wa huduma za afya, kuimarisha matokeo ya wagonjwa, na kuimarisha utendaji wa mfumo wa afya."
              }
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Why Work With Us?' : 'Kwa Nini Ufanye Kazi Nasi?'}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>{language === 'en' ? 'Make a meaningful impact on Kenya\'s healthcare system' : 'Fanya athari muhimu kwenye mfumo wa afya wa Kenya'}</li>
              <li>{language === 'en' ? 'Work with cutting-edge health technology' : 'Fanya kazi na teknolojia ya hali ya juu ya afya'}</li>
              <li>{language === 'en' ? 'Collaborate with passionate healthcare professionals' : 'Shirikiana na wataalamu wa afya wenye shauku'}</li>
              <li>{language === 'en' ? 'Competitive compensation and benefits' : 'Malipo ya ushindani na faida'}</li>
              <li>{language === 'en' ? 'Professional development opportunities' : 'Fursa za maendeleo ya kitaaluma'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'jobs':
        return renderJobsPage();
      case 'jobDetail':
        return renderJobDetail();
      case 'apply':
        return renderApplicationForm();
      case 'dashboard':
        return renderAdminDashboard();
      case 'about':
        return renderAboutPage();
      default:
        return (
          <div>
            {renderHero()}
            {renderStats()}
            {renderFeaturedJobs()}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {notification.message}
          </div>
        </div>
      )}

      {renderHeader()}
      {renderBreadcrumb()}
      {renderAuthModal()}
      {renderContent()}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">DHA Kenya</span>
              </div>
              <p className="text-gray-400">
                Building Kenya's digital health future through innovative technology and dedicated professionals.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-gray-400">
                <button onClick={() => setCurrentPage('about')} className="block hover:text-white transition-colors">About Us</button>
                <button onClick={() => setCurrentPage('jobs')} className="block hover:text-white transition-colors">Career Opportunities</button>
                <div className="hover:text-white transition-colors cursor-pointer">Application Process</div>
                <div className="hover:text-white transition-colors cursor-pointer">Contact Us</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white transition-colors cursor-pointer">Employee Handbook</div>
                <div className="hover:text-white transition-colors cursor-pointer">Benefits Guide</div>
                <div className="hover:text-white transition-colors cursor-pointer">Training Programs</div>
                <div className="hover:text-white transition-colors cursor-pointer">Digital Health Resources</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div>Ministry of Health</div>
                <div>P.O. Box 30016-00100</div>
                <div>Nairobi, Kenya</div>
                <div>careers@dha.go.ke</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Digital Health Agency, Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;