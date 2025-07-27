import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
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
  Mail,
  Phone,
  User,
  X
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
  doc,
  deleteDoc,
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
  const { sendStatusUpdateEmail, sendInterviewScheduledEmail } = useEmailNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applications' | 'analytics'>('overview');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
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
    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      setLoading(false);
      return;
    }
    
    loadJobs();
    loadApplications();
    createExampleJobs();
  }, []);

  const createExampleJobs = async () => {
    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      return;
    }
    
    try {
      // Check if example jobs already exist
      const jobsRef = collection(db, 'jobs');
      const existingJobs = await getDocs(jobsRef);
      
      if (existingJobs.empty) {
        const exampleJobs = [
          {
            title: 'Senior Health Data Analyst',
            department: 'Data & Analytics',
            location: 'Nairobi',
            type: 'full-time',
            salary: 'KES 120,000 - 180,000',
            description: 'We are seeking an experienced Senior Health Data Analyst to lead our data analytics initiatives and help transform Kenya\'s healthcare system through advanced data-driven insights. You will work with complex healthcare datasets, develop predictive models, and provide strategic recommendations to improve health outcomes across the country.',
            requirements: [
              'Master\'s degree in Statistics, Data Science, Public Health, or related field',
              'Minimum 5 years of experience in health data analysis',
              'Advanced proficiency in SQL, Python, R, and statistical software',
              'Experience with machine learning and predictive modeling',
              'Knowledge of healthcare systems, epidemiology, and health informatics',
              'Strong analytical, problem-solving, and communication skills',
              'Experience with data visualization tools (Tableau, Power BI, D3.js)',
              'Understanding of Kenyan health system and public health challenges'
            ],
            responsibilities: [
              'Lead complex health data analysis projects and initiatives',
              'Develop and implement predictive models for health outcomes',
              'Design and maintain comprehensive health dashboards and reports',
              'Collaborate with healthcare professionals and policymakers',
              'Ensure data quality, integrity, and compliance with health data standards',
              'Mentor junior analysts and provide technical guidance',
              'Present findings to senior leadership and external stakeholders',
              'Support evidence-based policy development and decision making'
            ],
            benefits: [
              'Competitive salary with performance-based bonuses',
              'Comprehensive health insurance for employee and family',
              'Professional development budget and conference attendance',
              'Flexible working arrangements and remote work options',
              'Annual leave, sick leave, and maternity/paternity benefits',
              'Pension scheme with employer contribution',
              'Life and disability insurance coverage',
              'Access to cutting-edge technology and tools'
            ],
            deadline: new Date('2024-03-15'),
            status: 'active',
            postedAt: new Date(),
            createdBy: currentUser?.uid || 'system'
          },
          {
            title: 'Digital Health Implementation Specialist',
            department: 'Digital Health',
            location: 'Kisumu',
            type: 'full-time',
            salary: 'KES 100,000 - 150,000',
            description: 'Join our Digital Health team as an Implementation Specialist to lead the deployment of innovative health technology solutions across western Kenya. You will work directly with healthcare facilities, county governments, and communities to ensure successful adoption of digital health tools that improve patient care and health system efficiency.',
            requirements: [
              'Bachelor\'s degree in Public Health, Health Informatics, IT, or related field',
              'Minimum 3 years of experience in digital health or health technology implementation',
              'Strong knowledge of health information systems and interoperability standards',
              'Experience with project management methodologies and tools',
              'Understanding of Kenyan healthcare landscape and county health systems',
              'Excellent communication, training, and stakeholder management skills',
              'Ability to travel frequently and work in diverse cultural settings',
              'Fluency in English and Kiswahili; local languages preferred'
            ],
            responsibilities: [
              'Lead end-to-end implementation of digital health solutions',
              'Coordinate with healthcare facilities and county health teams',
              'Provide comprehensive training and technical assistance to users',
              'Monitor system adoption, usage, and performance metrics',
              'Develop implementation strategies, guidelines, and best practices',
              'Support capacity building and change management initiatives',
              'Troubleshoot technical issues and coordinate with development teams',
              'Prepare detailed implementation reports and documentation'
            ],
            benefits: [
              'Competitive salary and comprehensive benefits package',
              'Travel allowances and field work compensation',
              'Professional development and certification opportunities',
              'Health insurance coverage for employee and dependents',
              'Performance-based bonuses and career advancement opportunities',
              'Retirement savings plan with employer matching',
              'Paid time off and flexible work arrangements',
              'Opportunity to make direct impact on healthcare delivery'
            ],
            deadline: new Date('2024-03-20'),
            status: 'active',
            postedAt: new Date(),
            createdBy: currentUser?.uid || 'system'
          },
          {
            title: 'Full Stack Software Developer',
            department: 'Information Technology',
            location: 'Nairobi',
            type: 'full-time',
            salary: 'KES 150,000 - 220,000',
            description: 'We are looking for a talented Full Stack Software Developer to join our growing IT team and help build the next generation of digital health solutions. You will work on web applications, mobile apps, APIs, and system integrations that directly impact healthcare delivery across Kenya. This role offers the opportunity to work with modern technologies while making a meaningful difference in public health.',
            requirements: [
              'Bachelor\'s degree in Computer Science, Software Engineering, or related field',
              'Minimum 4 years of full-stack development experience',
              'Proficiency in JavaScript/TypeScript, React, Node.js, and modern web frameworks',
              'Experience with databases (PostgreSQL, MongoDB) and cloud platforms (AWS, Azure, GCP)',
              'Knowledge of RESTful APIs, microservices architecture, and DevOps practices',
              'Understanding of healthcare standards (HL7, FHIR, DICOM) is highly preferred',
              'Strong problem-solving skills and attention to detail',
              'Experience with agile development methodologies and version control (Git)'
            ],
            responsibilities: [
              'Design and develop scalable web applications and mobile solutions',
              'Build and maintain RESTful APIs and microservices',
              'Collaborate with cross-functional teams on product development',
              'Write clean, maintainable, and well-documented code',
              'Participate in code reviews, testing, and deployment processes',
              'Optimize application performance and ensure security best practices',
              'Integrate with third-party systems and healthcare information systems',
              'Stay updated with latest technology trends and best practices'
            ],
            benefits: [
              'Highly competitive salary with equity options',
              'Comprehensive health, dental, and vision insurance',
              'Professional development budget for courses and certifications',
              'Flexible working hours and remote work opportunities',
              'Modern development tools, equipment, and technology stack',
              'Annual performance bonuses and salary reviews',
              'Retirement savings plan with company matching',
              'Collaborative work environment with talented team members'
            ],
            deadline: new Date('2024-03-25'),
            status: 'active',
            postedAt: new Date(),
            createdBy: currentUser?.uid || 'system'
          }
        ];

        // Add jobs to Firestore
        for (const job of exampleJobs) {
          await addDoc(collection(db, 'jobs'), {
            ...job,
            postedAt: serverTimestamp(),
            deadline: new Date(job.deadline)
          });
        }

        console.log('Example jobs created successfully');
      }
    } catch (error) {
      console.error('Error creating example jobs:', error);
    }
  };

  const loadJobs = () => {
    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      // Use mock data for demo user
      const mockJobs: JobListing[] = [
        {
          id: 'demo-job-1',
          title: 'Senior Health Data Analyst',
          department: 'Data & Analytics',
          location: 'Nairobi',
          type: 'full-time',
          salary: 'KES 120,000 - 180,000',
          description: 'We are seeking an experienced Senior Health Data Analyst to lead our data analytics initiatives and help transform Kenya\'s healthcare system through advanced data-driven insights.',
          requirements: [
            'Master\'s degree in Statistics, Data Science, Public Health, or related field',
            'Minimum 5 years of experience in health data analysis',
            'Advanced proficiency in SQL, Python, R, and statistical software'
          ],
          responsibilities: [
            'Lead complex health data analysis projects and initiatives',
            'Develop and implement predictive models for health outcomes',
            'Design and maintain comprehensive health dashboards and reports'
          ],
          benefits: [
            'Competitive salary with performance-based bonuses',
            'Comprehensive health insurance for employee and family',
            'Professional development budget and conference attendance'
          ],
          deadline: new Date('2024-03-15'),
          status: 'active',
          postedAt: new Date(),
          createdBy: 'demo-hr-user'
        },
        {
          id: 'demo-job-2',
          title: 'Digital Health Implementation Specialist',
          department: 'Digital Health',
          location: 'Kisumu',
          type: 'full-time',
          salary: 'KES 100,000 - 150,000',
          description: 'Join our Digital Health team as an Implementation Specialist to lead the deployment of innovative health technology solutions across western Kenya.',
          requirements: [
            'Bachelor\'s degree in Public Health, Health Informatics, IT, or related field',
            'Minimum 3 years of experience in digital health or health technology implementation',
            'Strong knowledge of health information systems and interoperability standards'
          ],
          responsibilities: [
            'Lead end-to-end implementation of digital health solutions',
            'Coordinate with healthcare facilities and county health teams',
            'Provide comprehensive training and technical assistance to users'
          ],
          benefits: [
            'Competitive salary and comprehensive benefits package',
            'Travel allowances and field work compensation',
            'Professional development and certification opportunities'
          ],
          deadline: new Date('2024-03-20'),
          status: 'active',
          postedAt: new Date(),
          createdBy: 'demo-hr-user'
        }
      ];
      
      setJobs(mockJobs);
      setLoading(false);
      return;
    }
    
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            postedAt: data.postedAt?.toDate() || new Date(),
            deadline: data.deadline?.toDate() || new Date(),
          } as JobListing;
        });
        
        setJobs(jobsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
      setLoading(false);
    }
  };

  const loadApplications = () => {
    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      // Use mock data for demo user
      const mockApplications: Application[] = [
        {
          id: 'demo-app-1',
          applicantId: 'demo-applicant-user',
          applicantName: 'John Doe',
          applicantEmail: 'john.doe@example.com',
          applicantPhone: '+254 700 123 456',
          jobId: 'demo-job-1',
          jobTitle: 'Senior Health Data Analyst',
          department: 'Data & Analytics',
          status: 'under-review',
          stage: 'technical-review',
          submittedAt: new Date('2024-01-15'),
          lastUpdated: new Date('2024-01-16'),
          coverLetter: 'I am excited to apply for the Senior Health Data Analyst position. With my background in statistics and healthcare data analysis, I believe I can contribute significantly to Kenya\'s digital health transformation.',
          notes: '',
          createdBy: 'demo-applicant-user'
        },
        {
          id: 'demo-app-2',
          applicantId: 'demo-applicant-user-2',
          applicantName: 'Jane Smith',
          applicantEmail: 'jane.smith@example.com',
          applicantPhone: '+254 700 987 654',
          jobId: 'demo-job-2',
          jobTitle: 'Digital Health Implementation Specialist',
          department: 'Digital Health',
          status: 'shortlisted',
          stage: 'interview-preparation',
          submittedAt: new Date('2024-01-12'),
          lastUpdated: new Date('2024-01-18'),
          coverLetter: 'As a passionate advocate for digital health solutions, I believe I would be an excellent fit for this role. My experience in implementing health technology systems aligns perfectly with DHA\'s mission.',
          notes: 'Strong technical background, excellent communication skills',
          createdBy: 'demo-applicant-user-2'
        }
      ];
      
      setApplications(mockApplications);
      return;
    }
    
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
        
        setApplications(applicationsData);
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

    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      // Add the new job to the local jobs state
      setJobs(prev => [newJob, ...prev]);
      
      setSuccess('Job posted successfully! (Demo mode)');
      setShowCreateJobModal(false);
      resetJobForm();
      setTimeout(() => setSuccess(''), 5000);
      return;
    }

    try {
      const jobData = {
        ...jobForm,
        requirements: jobForm.requirements.filter(req => req.trim() !== ''),
        responsibilities: jobForm.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: jobForm.benefits.filter(benefit => benefit.trim() !== ''),
        deadline: new Date(jobForm.deadline),
        postedAt: serverTimestamp(),
        createdBy: currentUser?.uid || 'system'
      };

      await addDoc(collection(db, 'jobs'), jobData);
      
      setSuccess('Job posted successfully!');
      setShowCreateJobModal(false);
      resetJobForm();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error creating job:', error);
      setError('Failed to create job. Please try again.');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: Application['status']) => {
    // Skip Firebase operations for demo users
    if (currentUser?.uid === 'demo-hr-user') {
      // Update local state for demo
      setApplications(prev => prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus, lastUpdated: new Date() }
          : app
      ));
      setSuccess('Application status updated successfully! (Demo mode)');
      setTimeout(() => setSuccess(''), 5000);
      return;
    }
    
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });

      // Send email notification
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        await sendStatusUpdateEmail(
          application.applicantEmail,
          application.jobTitle,
          application.applicantName,
          newStatus
        );
      }

      setSuccess('Application status updated successfully!');
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
    pendingApplications: applications.filter(app => app.status === 'submitted').length
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
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
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
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <User className="w-8 h-8 text-gray-400" />
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Listings</h2>
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </button>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
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
                          setShowJobModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
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
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.applicantName}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
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
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {application.department}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status.replace('-', ' ')}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        {application.submittedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Application ID: {application.id}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationModal(true);
                        }}
                        className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                      >
                        View Details
                      </button>
                      <select
                        value={application.status}
                        onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value as Application['status'])}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              ))}
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status Distribution</h3>
                <div className="space-y-3">
                  {['submitted', 'under-review', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'].map(status => {
                    const count = applications.filter(app => app.status === status).length;
                    const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status.replace('-', ' ')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Department</h3>
                <div className="space-y-3">
                  {Array.from(new Set(applications.map(app => app.department))).map(department => {
                    const count = applications.filter(app => app.department === department).length;
                    const percentage = applications.length > 0 ? (count / applications.length) * 100 : 0;
                    
                    return (
                      <div key={department} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{department}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Department:</strong> {selectedJob.department}</div>
                <div><strong>Location:</strong> {selectedJob.location}</div>
                <div><strong>Type:</strong> {selectedJob.type}</div>
                <div><strong>Salary:</strong> {selectedJob.salary}</div>
                <div><strong>Status:</strong> {selectedJob.status}</div>
                <div><strong>Deadline:</strong> {selectedJob.deadline.toLocaleDateString()}</div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Responsibilities</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedJob.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedJob.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
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
              <div className="grid grid-cols-1 gap-4">
                <div><strong>Applicant:</strong> {selectedApplication.applicantName}</div>
                <div><strong>Email:</strong> {selectedApplication.applicantEmail}</div>
                <div><strong>Phone:</strong> {selectedApplication.applicantPhone}</div>
                <div><strong>Position:</strong> {selectedApplication.jobTitle}</div>
                <div><strong>Department:</strong> {selectedApplication.department}</div>
                <div><strong>Status:</strong> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status.replace('-', ' ')}
                  </span>
                </div>
                <div><strong>Submitted:</strong> {selectedApplication.submittedAt.toLocaleDateString()}</div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cover Letter</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => {
                    handleUpdateApplicationStatus(selectedApplication.id, e.target.value as Application['status']);
                    setShowApplicationModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Post New Job</h2>
                <button
                  onClick={() => setShowCreateJobModal(false)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.department}
                      onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={jobForm.location}
                      onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                    <select
                      required
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range *</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    rows={6}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={jobForm.description}
                    onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateJobModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Post Job
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