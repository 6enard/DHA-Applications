import React, { useState, useEffect } from 'react';
import { Briefcase, Users, FileText, Settings, Menu, X, Globe, Bell, Search, Filter, Plus, Eye, Edit, Trash2, Download, Upload, Calendar, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Heart, Building, LogOut, User, ChevronRight } from 'lucide-react';
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
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'applicant' | 'hr' | 'admin';
  profile?: {
    experience: string;
    education: string;
    skills: string[];
    resume: string;
  };
}

const translations = {
  en: {
    title: 'Digital Health Agency - Job Portal',
    nav: {
      jobs: 'Jobs',
      applications: 'Applications',
      dashboard: 'Dashboard',
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    hero: {
      title: 'Build Kenya\'s Digital Health Future',
      subtitle: 'Join the Digital Health Agency and make a difference in healthcare technology across Kenya',
      searchPlaceholder: 'Search for jobs...',
      searchButton: 'Search Jobs'
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
      title: 'HR Dashboard',
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
      jobs: 'Kazi',
      applications: 'Maombi',
      dashboard: 'Dashibodi',
      profile: 'Wasifu',
      login: 'Ingia',
      register: 'Jisajili',
      logout: 'Toka'
    },
    hero: {
      title: 'Jenga Mustakabali wa Afya ya Kidijitali Kenya',
      subtitle: 'Jiunge na Wakala wa Afya ya Kidijitali na ulete mabadiliko katika teknolojia ya afya nchini Kenya',
      searchPlaceholder: 'Tafuta kazi...',
      searchButton: 'Tafuta Kazi'
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
      title: 'Dashibodi ya HR',
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
    documents: ['Resume.pdf', 'Cover Letter.pdf', 'Certificates.pdf']
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
    documents: ['Resume.pdf', 'Portfolio.pdf']
  }
];

const AppContent: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [language, setLanguage] = useState<'en' | 'sw'>('en');
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedJob, setSelectedJob] = useState<any>(null);
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
    documents: [] as string[]
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogin = (email: string, password: string) => {
    // Mock login - in real app would authenticate with backend
    if (email === 'hr@dha.go.ke') {
      setUser({
        id: '1',
        name: 'HR Manager',
        email: 'hr@dha.go.ke',
        phone: '+254700000000',
        role: 'hr'
      });
    } else {
      setUser({
        id: '2',
        name: 'John Doe',
        email: email,
        phone: '+254700000001',
        role: 'applicant'
      });
    }
    setCurrentPage('home');
  };

  const handleApplicationSubmit = () => {
    if (!applicationForm.name || !applicationForm.email || !applicationForm.phone || !selectedJob) {
      showNotification('error', t.application.error);
      return;
    }

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
      documents: applicationForm.documents
    };

    setApplications([...applications, newApplication]);
    showNotification('success', t.application.success);
    setApplicationForm({
      name: '',
      email: '',
      phone: '',
      experience: '',
      education: '',
      documents: []
    });
    setSelectedJob(null);
    setCurrentPage('jobs');
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
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // If user is HR, show admin dashboard
  if (currentUser && userProfile?.role === 'hr') {
    return <AdminDashboard />;
  }

  const renderAuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
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

  const renderHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">DHA</h1>
                <p className="text-xs text-gray-600">Digital Health Agency</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => setCurrentPage('home')}
              className={`${
                currentPage === 'home' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              {language === 'en' ? 'Home' : 'Nyumbani'}
            </button>
            <button
              onClick={() => setCurrentPage('jobs')}
              className={`${
                currentPage === 'jobs' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              {language === 'en' ? 'Jobs' : 'Kazi'}
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`${
                currentPage === 'about' ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              } px-3 py-2 text-sm font-medium transition-colors`}
            >
              {language === 'en' ? 'About' : 'Kuhusu'}
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'SW' : 'EN'}</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {currentUser ? (
              <>
                <button className="text-gray-600 hover:text-green-600 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">{userProfile?.displayName || 'User'}</span>
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 transition-colors"
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
                  {language === 'en' ? 'Sign In' : 'Ingia'}
                </button>
                <button
                  onClick={() => {setAuthMode('register'); setShowAuthModal(true);}}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {language === 'en' ? 'Get Started' : 'Anza'}
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

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {language === 'en' ? 'Dashboard' : 'Dashibodi'}
                  </button>
                  <button
                    onClick={() => setCurrentPage('profile')}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {language === 'en' ? 'Profile' : 'Wasifu'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md w-full text-left"
                  >
                    {language === 'en' ? 'Sign Out' : 'Toka'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {setAuthMode('login'); setShowAuthModal(true); setIsMenuOpen(false);}}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {language === 'en' ? 'Sign In' : 'Ingia'}
                  </button>
                  <button
                    onClick={() => {setAuthMode('register'); setShowAuthModal(true); setIsMenuOpen(false);}}
                    className="block px-3 py-2 text-base font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md w-full text-left"
                  >
                    {language === 'en' ? 'Get Started' : 'Anza'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const renderHero = () => (
    <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-blue-800 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {language === 'en' 
              ? "Build Kenya's Digital Health Future" 
              : "Jenga Mustakabali wa Afya ya Kidijitali Kenya"
            }
          </h1>
          <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
            {language === 'en'
              ? "Join the Digital Health Agency and make a difference in healthcare technology across Kenya"
              : "Jiunge na Wakala wa Afya ya Kidijitali na ulete mabadiliko katika teknolojia ya afya nchini Kenya"
            }
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={language === 'en' ? "Search for jobs..." : "Tafuta kazi..."}
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
                {language === 'en' ? 'Search Jobs' : 'Tafuta Kazi'}
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
            <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
            <div className="text-gray-600">
              {language === 'en' ? 'Open Positions' : 'Nafasi Wazi'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
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
                  {language === 'en' ? 'View Details' : 'Angalia Maelezo'}
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

  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'en' ? 'My Dashboard' : 'Dashibodi Yangu'}
            </h1>
            <p className="text-gray-600">
              {language === 'en' ? 'Track your applications and profile' : 'Fuatilia maombi yako na wasifu'}
            </p>
          </div>

          {/* Dashboard content would go here */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {language === 'en' ? 'Recent Applications' : 'Maombi ya Hivi Karibuni'}
            </h2>
            <p className="text-gray-600">
              {language === 'en' ? 'No applications yet. Start by browsing available jobs.' : 'Hakuna maombi bado. Anza kwa kutazama kazi zinazopatikana.'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'jobs':
        return renderJobsPage();
      case 'jobDetail':
        return renderJobDetail();
      case 'dashboard':
        return renderDashboard();
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

  const renderJobsPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Available Positions' : 'Nafasi Zinazopatikana'}
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
                    {language === 'en' ? 'View Details' : 'Angalia Maelezo'}
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setCurrentPage('apply');
                      }}
                      className="border border-green-600 text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
                    >
                      {language === 'en' ? 'Apply Now' : 'Omba Sasa'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderJobDetail = () => {
    if (!selectedJob) return null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => setCurrentPage('jobs')}
            className="text-green-600 hover:text-green-700 font-medium mb-6 flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {language === 'en' ? 'Back to Jobs' : 'Rudi kwa Kazi'}
          </button>

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
                    {language === 'en' ? 'Apply Now' : 'Omba Sasa'}
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
      {renderAuthModal()}
      {renderContent()}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
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
                <div>About Us</div>
                <div>Career Opportunities</div>
                <div>Application Process</div>
                <div>Contact Us</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2 text-gray-400">
                <div>Employee Handbook</div>
                <div>Benefits Guide</div>
                <div>Training Programs</div>
                <div>Digital Health Resources</div>
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