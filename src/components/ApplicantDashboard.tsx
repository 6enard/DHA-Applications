import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Eye, 
  LogOut,
  Shield,
  Search,
  Filter,
  Building,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
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
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'submitted' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'rejected' | 'hired';
  submittedAt: Date;
  coverLetter: string;
}

const ApplicantDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [currentUser]);

  const loadJobs = () => {
    // Mock job data - in real implementation, load from Firebase
    const mockJobs: JobListing[] = [
      {
        id: 'job1',
        title: 'Health Data Analyst',
        department: 'Data & Analytics',
        location: 'Nairobi',
        type: 'full-time',
        salary: 'KES 80,000 - 120,000',
        description: 'We are seeking a skilled Health Data Analyst to join our team and help transform Kenya\'s healthcare system through data-driven insights. You will work with large healthcare datasets to identify trends, patterns, and opportunities for improvement.',
        requirements: [
          'Bachelor\'s degree in Statistics, Mathematics, Computer Science, or related field',
          'Minimum 2 years of experience in data analysis',
          'Proficiency in SQL, Python, or R',
          'Experience with data visualization tools (Tableau, Power BI)',
          'Knowledge of healthcare systems and terminology',
          'Strong analytical and problem-solving skills'
        ],
        responsibilities: [
          'Analyze healthcare data to identify trends and patterns',
          'Create comprehensive reports and dashboards',
          'Collaborate with healthcare professionals to understand data needs',
          'Ensure data quality and integrity',
          'Present findings to stakeholders',
          'Support evidence-based decision making'
        ],
        benefits: [
          'Competitive salary and benefits package',
          'Health insurance coverage',
          'Professional development opportunities',
          'Flexible working arrangements',
          'Annual leave and sick leave',
          'Pension scheme contribution'
        ],
        deadline: new Date('2024-02-15'),
        status: 'active',
        postedAt: new Date('2024-01-01')
      },
      {
        id: 'job2',
        title: 'Digital Health Specialist',
        department: 'Digital Health',
        location: 'Kisumu',
        type: 'full-time',
        salary: 'KES 90,000 - 140,000',
        description: 'Join our Digital Health team to lead the implementation of innovative health technology solutions across Kenya. You will work on projects that directly impact healthcare delivery and patient outcomes.',
        requirements: [
          'Master\'s degree in Public Health, Health Informatics, or related field',
          'Minimum 3 years of experience in digital health or health technology',
          'Knowledge of health information systems',
          'Experience with project management',
          'Understanding of Kenyan healthcare landscape',
          'Excellent communication and leadership skills'
        ],
        responsibilities: [
          'Lead digital health project implementation',
          'Coordinate with healthcare facilities and stakeholders',
          'Provide technical assistance and training',
          'Monitor and evaluate project outcomes',
          'Develop implementation strategies and guidelines',
          'Support capacity building initiatives'
        ],
        benefits: [
          'Competitive salary and comprehensive benefits',
          'Travel allowances for field work',
          'Professional development and training',
          'Health and life insurance',
          'Performance-based bonuses',
          'Career advancement opportunities'
        ],
        deadline: new Date('2024-02-20'),
        status: 'active',
        postedAt: new Date('2024-01-05')
      },
      {
        id: 'job3',
        title: 'Health Systems Coordinator',
        department: 'Health Systems',
        location: 'Mombasa',
        type: 'full-time',
        salary: 'KES 70,000 - 100,000',
        description: 'We are looking for a Health Systems Coordinator to support the strengthening of health systems in coastal Kenya. You will work closely with county health teams and healthcare facilities.',
        requirements: [
          'Bachelor\'s degree in Public Health, Medicine, or related field',
          'Minimum 2 years of experience in health systems strengthening',
          'Knowledge of Kenyan health system structure',
          'Experience working with county governments',
          'Strong organizational and coordination skills',
          'Fluency in English and Kiswahili'
        ],
        responsibilities: [
          'Coordinate health systems strengthening activities',
          'Support county health teams in planning and implementation',
          'Facilitate stakeholder meetings and workshops',
          'Monitor progress and prepare reports',
          'Provide technical assistance to healthcare facilities',
          'Support quality improvement initiatives'
        ],
        benefits: [
          'Competitive salary package',
          'Health insurance for employee and family',
          'Transportation allowance',
          'Professional development opportunities',
          'Annual performance bonuses',
          'Retirement benefits'
        ],
        deadline: new Date('2024-02-10'),
        status: 'active',
        postedAt: new Date('2023-12-20')
      },
      {
        id: 'job4',
        title: 'Health Information Systems Manager',
        department: 'Health Information Systems',
        location: 'Nakuru',
        type: 'contract',
        salary: 'KES 100,000 - 150,000',
        description: 'Lead the implementation and management of health information systems across multiple counties. This is a 12-month contract position with possibility of extension.',
        requirements: [
          'Bachelor\'s degree in Information Technology, Computer Science, or related field',
          'Minimum 4 years of experience in health information systems',
          'Experience with DHIS2, EMR systems, and health data management',
          'Project management certification preferred',
          'Strong technical and leadership skills',
          'Experience working in resource-limited settings'
        ],
        responsibilities: [
          'Oversee implementation of health information systems',
          'Manage technical teams and contractors',
          'Ensure system integration and interoperability',
          'Provide training and technical support',
          'Monitor system performance and user adoption',
          'Develop technical documentation and procedures'
        ],
        benefits: [
          'Competitive contract rate',
          'Health insurance coverage',
          'Travel and accommodation allowances',
          'Professional development support',
          'Flexible working arrangements',
          'Potential for contract extension'
        ],
        deadline: new Date('2024-02-25'),
        status: 'active',
        postedAt: new Date('2024-01-10')
      }
      {
        id: 'job5',
        title: 'Public Health Officer',
        department: 'Public Health',
        location: 'Eldoret',
        type: 'full-time',
        salary: 'KES 60,000 - 85,000',
        description: 'Join our Public Health team to support community health programs and disease prevention initiatives across Uasin Gishu County. You will work directly with communities to improve health outcomes.',
        requirements: [
          'Bachelor\'s degree in Public Health, Community Health, or related field',
          'Minimum 1 year of experience in public health programs',
          'Knowledge of community health strategies',
          'Experience in health education and promotion',
          'Strong communication and interpersonal skills',
          'Ability to work in rural and urban settings'
        ],
        responsibilities: [
          'Implement community health programs',
          'Conduct health education sessions',
          'Support disease surveillance activities',
          'Collaborate with community health volunteers',
          'Monitor and evaluate program effectiveness',
          'Prepare reports and documentation'
        ],
        benefits: [
          'Competitive salary and allowances',
          'Health insurance coverage',
          'Field work allowances',
          'Training and capacity building',
          'Career growth opportunities',
          'Leave benefits'
        ],
        deadline: new Date('2024-03-01'),
        status: 'active',
        postedAt: new Date('2024-01-15')
      },
      {
        id: 'job6',
        title: 'Software Developer',
        department: 'Information Technology',
        location: 'Nairobi',
        type: 'full-time',
        salary: 'KES 120,000 - 180,000',
        description: 'We are looking for a talented Software Developer to join our IT team and help build innovative digital health solutions. You will work on web applications, mobile apps, and system integrations.',
        requirements: [
          'Bachelor\'s degree in Computer Science, Software Engineering, or related field',
          'Minimum 3 years of experience in software development',
          'Proficiency in JavaScript, React, Node.js, and databases',
          'Experience with cloud platforms (AWS, Azure, or GCP)',
          'Knowledge of healthcare standards (HL7, FHIR) is a plus',
          'Strong problem-solving and debugging skills'
        ],
        responsibilities: [
          'Develop and maintain web applications and APIs',
          'Collaborate with cross-functional teams on product development',
          'Write clean, maintainable, and well-documented code',
          'Participate in code reviews and testing',
          'Troubleshoot and resolve technical issues',
          'Stay updated with latest technology trends'
        ],
        benefits: [
          'Competitive salary and performance bonuses',
          'Comprehensive health insurance',
          'Professional development budget',
          'Flexible working hours and remote work options',
          'Modern development tools and equipment',
          'Stock options and retirement benefits'
        ],
        deadline: new Date('2024-02-28'),
        status: 'active',
        postedAt: new Date('2024-01-08')
      },
      {
        id: 'job7',
        title: 'Health Communication Specialist',
        department: 'Communications',
        location: 'Nairobi',
        type: 'part-time',
        salary: 'KES 45,000 - 65,000',
        description: 'Support our communications team in developing and implementing health communication strategies. This part-time position is perfect for someone looking to make an impact in health advocacy.',
        requirements: [
          'Bachelor\'s degree in Communications, Journalism, Public Relations, or related field',
          'Minimum 2 years of experience in health communication or related field',
          'Excellent writing and editing skills',
          'Experience with social media management',
          'Knowledge of health topics and terminology',
          'Creative thinking and attention to detail'
        ],
        responsibilities: [
          'Develop health communication materials and campaigns',
          'Manage social media accounts and content',
          'Write press releases and media advisories',
          'Support event planning and coordination',
          'Monitor media coverage and public sentiment',
          'Collaborate with health experts on content creation'
        ],
        benefits: [
          'Flexible part-time schedule',
          'Competitive hourly rate',
          'Health insurance contribution',
          'Professional development opportunities',
          'Work-from-home options',
          'Networking opportunities in health sector'
        ],
        deadline: new Date('2024-02-18'),
        status: 'active',
        postedAt: new Date('2024-01-12')
      },
      {
        id: 'job8',
        title: 'Research Assistant',
        department: 'Research & Development',
        location: 'Kisumu',
        type: 'contract',
        salary: 'KES 55,000 - 75,000',
        description: 'Join our research team to support ongoing health research projects. This 6-month contract position offers excellent experience in health research methodologies and data collection.',
        requirements: [
          'Bachelor\'s degree in Public Health, Statistics, Social Sciences, or related field',
          'Experience in research methodology and data collection',
          'Proficiency in statistical software (SPSS, R, or Stata)',
          'Strong analytical and writing skills',
          'Attention to detail and accuracy',
          'Ability to work independently and meet deadlines'
        ],
        responsibilities: [
          'Assist in research design and protocol development',
          'Conduct literature reviews and data collection',
          'Perform statistical analysis and data interpretation',
          'Prepare research reports and presentations',
          'Support manuscript preparation for publication',
          'Maintain research databases and documentation'
        ],
        benefits: [
          'Competitive contract compensation',
          'Research experience and mentorship',
          'Publication opportunities',
          'Conference attendance support',
          'Networking with research community',
          'Potential for contract extension'
        ],
        deadline: new Date('2024-02-22'),
        status: 'active',
        postedAt: new Date('2024-01-18')
      },
      {
        id: 'job9',
        title: 'Health Finance Analyst',
        department: 'Finance & Administration',
        location: 'Nairobi',
        type: 'full-time',
        salary: 'KES 85,000 - 125,000',
        description: 'We are seeking a Health Finance Analyst to support financial planning and analysis for our health programs. You will work on budget development, financial monitoring, and cost-effectiveness analysis.',
        requirements: [
          'Bachelor\'s degree in Finance, Economics, Accounting, or related field',
          'Minimum 3 years of experience in financial analysis',
          'Knowledge of health economics and financing',
          'Proficiency in Excel, financial modeling, and analysis tools',
          'Understanding of donor funding and grant management',
          'Strong quantitative and analytical skills'
        ],
        responsibilities: [
          'Develop and monitor program budgets and financial plans',
          'Conduct cost-effectiveness and financial impact analysis',
          'Prepare financial reports for donors and stakeholders',
          'Support grant proposal development and management',
          'Monitor expenditures and ensure compliance',
          'Provide financial insights for decision-making'
        ],
        benefits: [
          'Competitive salary and annual increments',
          'Comprehensive health and life insurance',
          'Professional certification support (CPA, CFA)',
          'Performance-based bonuses',
          'Retirement savings plan',
          'Professional development opportunities'
        ],
        deadline: new Date('2024-03-05'),
        status: 'active',
        postedAt: new Date('2024-01-20')
      },
      {
        id: 'job10',
        title: 'Clinical Data Manager',
        department: 'Clinical Research',
        location: 'Mombasa',
        type: 'full-time',
        salary: 'KES 95,000 - 135,000',
        description: 'Lead clinical data management activities for our research studies. You will ensure data quality, integrity, and compliance with regulatory standards in clinical research.',
        requirements: [
          'Bachelor\'s degree in Life Sciences, Statistics, or related field',
          'Minimum 4 years of experience in clinical data management',
          'Knowledge of GCP, ICH guidelines, and regulatory requirements',
          'Experience with clinical data management systems (CDMS)',
          'Strong attention to detail and quality focus',
          'Excellent organizational and project management skills'
        ],
        responsibilities: [
          'Design and maintain clinical databases',
          'Develop data management plans and procedures',
          'Monitor data quality and perform data cleaning',
          'Ensure compliance with regulatory standards',
          'Train and supervise data entry staff',
          'Prepare data for statistical analysis and reporting'
        ],
        benefits: [
          'Competitive salary and benefits package',
          'Health insurance for family',
          'Professional development and training',
          'Conference attendance opportunities',
          'Flexible working arrangements',
          'Career advancement in clinical research'
        ],
        deadline: new Date('2024-02-12'),
        status: 'active',
        postedAt: new Date('2024-01-03')
      }
    ];

    setJobs(mockJobs);
    setLoading(false);
  };

  const loadApplications = async () => {
    if (!currentUser) return;

    try {
      // Load real applications from Firebase
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef, 
        where('applicantId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const applicationsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate(),
          } as Application;
        });
        
        // Add demo applications for demo user
        if (currentUser.uid === 'demo-applicant-user') {
          const demoApplications: Application[] = [
            {
              id: 'demo-app-1',
              jobId: 'job1',
              jobTitle: 'Health Data Analyst',
              department: 'Data & Analytics',
              status: 'under-review',
              submittedAt: new Date('2024-01-15'),
              coverLetter: 'I am excited to apply for the Health Data Analyst position. With my background in statistics and healthcare data analysis, I believe I can contribute significantly to Kenya\'s digital health transformation.'
            },
            {
              id: 'demo-app-2',
              jobId: 'job2',
              jobTitle: 'Digital Health Specialist',
              department: 'Digital Health',
              status: 'shortlisted',
              submittedAt: new Date('2024-01-12'),
              coverLetter: 'As a passionate advocate for digital health solutions, I believe I would be an excellent fit for this role. My experience in implementing health technology systems aligns perfectly with DHA\'s mission.'
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

  const handleApplyForJob = async () => {
    if (!selectedJob || !currentUser || !coverLetter.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if already applied
    const existingApplication = applications.find(app => app.jobId === selectedJob.id);
    if (existingApplication) {
      setError('You have already applied for this position');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        applicantId: currentUser.uid,
        applicantName: userProfile?.displayName || currentUser.displayName || 'Unknown',
        applicantEmail: currentUser.email,
        applicantPhone: '+254 700 000 000', // In real app, get from user profile
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: coverLetter.trim(),
        notes: '',
        createdBy: currentUser.uid
      };

      // Skip Firebase for demo user
      if (currentUser.uid !== 'demo-applicant-user') {
        await addDoc(collection(db, 'applications'), applicationData);
      }

      setSuccess('Application submitted successfully!');
      setCoverLetter('');
      setShowApplicationModal(false);
      
      // Refresh applications
      loadApplications();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const isActive = job.status === 'active' && job.deadline > new Date();
    
    return matchesSearch && matchesDepartment && matchesType && isActive;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Career Portal</h1>
                <p className="text-gray-600">Digital Health Agency - Job Opportunities</p>
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
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Jobs ({filteredJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Applications ({applications.length})
            </button>
          </nav>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <option value="Health Information Systems">Health Information Systems</option>
                </select>
                
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>

            {/* Job Listings */}
            <div className="grid gap-6">
              {filteredJobs.map((job) => {
                const hasApplied = applications.some(app => app.jobId === job.id);
                const daysLeft = Math.ceil((job.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
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
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                      </div>
                      <div className="ml-6 text-right">
                        <div className={`text-sm font-medium mb-2 ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
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
                        Deadline: {job.deadline.toLocaleDateString()}
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
                        {!hasApplied && daysLeft > 0 && (
                          <button
                            onClick={() => {
                              setSelectedJob(job);
                              setShowApplicationModal(true);
                              setCoverLetter('');
                              setError('');
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {applications.length > 0 ? (
              <div className="grid gap-6">
                {applications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.jobTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{application.department}</span>
                          <span>Applied: {application.submittedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(application.status)}
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <p className="text-gray-700 text-sm">{application.coverLetter}</p>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      Application ID: {application.id}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">You haven't applied for any positions yet.</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            )}
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
                  <XCircle className="w-6 h-6" />
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
                      setCoverLetter('');
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
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Cover Letter *</h3>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us why you're interested in this position and how your skills and experience make you a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  {coverLetter.length}/1000 characters
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Application Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Name: {userProfile?.displayName}</p>
                  <p>Email: {currentUser?.email}</p>
                  <p>Position: {selectedJob.title}</p>
                  <p>Department: {selectedJob.department}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyForJob}
                  disabled={submitting || !coverLetter.trim()}
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
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantDashboard;