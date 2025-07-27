import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Eye,
  Download,
  Edit,
  Plus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  Briefcase,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  deadline: Date;
  description: string;
  requirements: string[];
  responsibilities: string[];
}

interface Application {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  jobId: string;
  jobTitle: string;
  department: string;
  status: 'draft' | 'submitted' | 'under-review' | 'shortlisted' | 'rejected' | 'hired';
  stage: 'initial-review' | 'technical-review' | 'hr-review' | 'final-review' | 'completed';
  submittedAt?: Date;
  lastUpdated: Date;
  coverLetter: string;
  resumeUrl?: string;
  notes?: string;
  score?: number;
  reviewedBy?: string;
  createdBy: string;
}

const ApplicantDashboard: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'profile'>('jobs');
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: '',
    resumeFile: null as File | null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load jobs and user's applications from Firebase
  useEffect(() => {
    loadJobs();
    if (currentUser) {
      loadUserApplications();
    }
  }, [currentUser]);

  const loadJobs = async () => {
    try {
      // For demo purposes, use mock data
      // In production, load from Firebase: const jobsRef = collection(db, 'jobs');
      const mockJobs: JobListing[] = [
        {
          id: '1',
          title: 'Health Data Analyst',
          department: 'Data & Analytics',
          location: 'Nairobi',
          type: 'full-time',
          deadline: new Date('2024-02-15'),
          description: 'We are seeking a skilled Health Data Analyst to join our team and help transform healthcare delivery in Kenya through data-driven insights.',
          requirements: [
            'Bachelor\'s degree in Statistics, Computer Science, or related field',
            'Minimum 2 years experience in data analysis',
            'Proficiency in SQL, Python, or R',
            'Experience with healthcare data preferred',
            'Strong analytical and problem-solving skills'
          ],
          responsibilities: [
            'Analyze health data to identify trends and patterns',
            'Create reports and dashboards for stakeholders',
            'Collaborate with healthcare professionals',
            'Ensure data quality and integrity',
            'Support evidence-based decision making'
          ]
        },
        {
          id: '2',
          title: 'Digital Health Specialist',
          department: 'Digital Health',
          location: 'Kisumu',
          type: 'full-time',
          deadline: new Date('2024-02-20'),
          description: 'Join our Digital Health team to implement and manage digital health solutions across Kenya.',
          requirements: [
            'Master\'s degree in Public Health or related field',
            'Experience with digital health systems',
            'Knowledge of healthcare workflows',
            'Project management skills',
            'Excellent communication skills'
          ],
          responsibilities: [
            'Implement digital health solutions',
            'Train healthcare workers on new systems',
            'Monitor system performance',
            'Coordinate with technical teams',
            'Ensure compliance with health standards'
          ]
        },
        {
          id: '3',
          title: 'Health Systems Coordinator',
          department: 'Health Systems',
          location: 'Mombasa',
          type: 'full-time',
          deadline: new Date('2024-02-10'),
          description: 'Coordinate health system strengthening initiatives across coastal Kenya.',
          requirements: [
            'Bachelor\'s degree in Health Management or related field',
            'Minimum 3 years in health systems',
            'Experience in project coordination',
            'Knowledge of Kenyan health system',
            'Strong leadership skills'
          ],
          responsibilities: [
            'Coordinate health system projects',
            'Liaise with county health teams',
            'Monitor project implementation',
            'Prepare progress reports',
            'Facilitate stakeholder meetings'
          ]
        }
      ];
      setJobs(mockJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load job listings');
    }
  };

  const loadUserApplications = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      // Set up real-time listener for user's applications
      const applicationsRef = collection(db, 'applications');
      const q = query(
        applicationsRef, 
        where('applicantId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userApplications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt?.toDate(),
            lastUpdated: data.lastUpdated?.toDate()
          } as Application;
        });
        
        setApplications(userApplications);
        setLoading(false);
      });

      // For demo purposes, also include mock data if no real applications exist
      if (currentUser.uid === 'demo-applicant-user') {
        const mockApplications: Application[] = [
          {
            id: 'demo-app-1',
            applicantId: currentUser.uid,
            applicantName: userProfile?.displayName || 'Demo Applicant',
            applicantEmail: userProfile?.email || 'applicant@email.com',
            applicantPhone: '+254 712 345 678',
            jobId: '1',
            jobTitle: 'Health Data Analyst',
            department: 'Data & Analytics',
            status: 'under-review',
            stage: 'technical-review',
            submittedAt: new Date('2024-01-15'),
            lastUpdated: new Date('2024-01-18'),
            coverLetter: 'I am excited to apply for the Health Data Analyst position. With my background in statistics and healthcare data analysis, I believe I can contribute significantly to Kenya\'s digital health transformation.',
            createdBy: currentUser.uid
          }
        ];
        setApplications(mockApplications);
        setLoading(false);
      }

      return unsubscribe;
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load your applications');
      setLoading(false);
    }
  };

  const handleApply = (job: JobListing) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = async () => {
    if (!selectedJob || !currentUser || !userProfile) return;

    try {
      setLoading(true);
      setError('');

      const applicationData = {
        applicantId: currentUser.uid,
        applicantName: userProfile.displayName,
        applicantEmail: userProfile.email,
        applicantPhone: '+254 XXX XXX XXX', // You can add phone to user profile
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: applicationForm.coverLetter,
        notes: '',
        createdBy: currentUser.uid
      };

      // Add to Firebase
      const applicationsRef = collection(db, 'applications');
      const docRef = await addDoc(applicationsRef, applicationData);

      console.log('Application submitted with ID:', docRef.id);

      // Reset form and close modal
      setShowApplicationModal(false);
      setApplicationForm({ coverLetter: '', resumeFile: null });
      setSelectedJob(null);
      
      // Show success message
      alert('Application submitted successfully! HR will review your application soon.');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && applications.length === 0) {
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
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {userProfile?.displayName}</h1>
              <p className="text-gray-600">Digital Health Agency - Job Portal</p>
              <div className="text-sm text-gray-500 mt-1">
                Account ID: {currentUser?.uid} | Status: {userProfile?.role === 'applicant' ? 'Job Seeker' : userProfile?.role}
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              Available Jobs
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
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">All Departments</option>
                  <option value="data">Data & Analytics</option>
                  <option value="digital">Digital Health</option>
                  <option value="systems">Health Systems</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline: {job.deadline.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {job.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {job.requirements.length} requirements • {job.responsibilities.length} responsibilities
                    </div>
                    <button
                      onClick={() => handleApply(job)}
                      disabled={loading}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start by applying to available positions</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stage
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
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {application.jobTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status.replace('-', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="capitalize">{application.stage?.replace('-', ' ') || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.submittedAt?.toLocaleDateString() || 'Draft'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 mr-4">
                              <Eye className="w-4 h-4" />
                            </button>
                            {application.status === 'draft' && (
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-6">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{userProfile?.displayName}</h3>
                  <p className="text-gray-600">{userProfile?.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      Job Applicant
                    </span>
                    {currentUser?.uid === 'demo-applicant-user' && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        ✓ Demo Account
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{userProfile?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">+254 XXX XXX XXX</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">Nairobi, Kenya</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">User ID:</span>
                      <p className="text-gray-700 font-mono text-sm">{currentUser?.uid}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Member since:</span>
                      <p className="text-gray-700">{userProfile?.createdAt?.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account type:</span>
                      <p className="text-gray-700 capitalize">{userProfile?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mr-4">
                  Edit Profile
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Upload Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">{selectedJob.description}</p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Department:</strong> {selectedJob.department}</p>
                    <p><strong>Location:</strong> {selectedJob.location}</p>
                    <p><strong>Type:</strong> {selectedJob.type}</p>
                    <p><strong>Deadline:</strong> {selectedJob.deadline.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, resumeFile: e.target.files?.[0] || null }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={!applicationForm.coverLetter.trim() || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
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
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      department: selectedJob.department,
      status: 'submitted',
      submittedAt: new Date(),
      coverLetter: applicationForm.coverLetter,
      applicantId: currentUser?.uid || '', // Link to authenticated user
      applicantName: userProfile?.displayName || '',
      applicantEmail: userProfile?.email || ''
    };

    setApplications(prev => [...prev, newApplication]);
    setShowApplicationModal(false);
    setApplicationForm({ coverLetter: '', resumeFile: null });
    setSelectedJob(null);
    
    // In a real implementation, save to Firebase:
    // const applicationsRef = collection(db, 'applications');
    // await addDoc(applicationsRef, {
    //   ...newApplication,
    //   createdBy: currentUser?.uid,
    //   submittedAt: new Date(),
    //   lastUpdated: new Date()
    // });
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under-review': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'under-review': return <Clock className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {userProfile?.displayName}</h1>
              <p className="text-gray-600">Digital Health Agency - Job Portal</p>
            </div>
            <div className="flex items-center space-x-4">
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
              Available Jobs
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
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Available Positions</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">All Departments</option>
                  <option value="data">Data & Analytics</option>
                  <option value="digital">Digital Health</option>
                  <option value="systems">Health Systems</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {job.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {job.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Deadline: {job.deadline.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {job.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {job.requirements.length} requirements • {job.responsibilities.length} responsibilities
                    </div>
                    <button
                      onClick={() => handleApply(job)}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start by applying to available positions</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
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
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {application.jobTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1 capitalize">{application.status.replace('-', ' ')}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.submittedAt?.toLocaleDateString() || 'Draft'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 mr-4">
                              <Eye className="w-4 h-4" />
                            </button>
                            {application.status === 'draft' && (
                              <button className="text-blue-600 hover:text-blue-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-6">
                  <User className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{userProfile?.displayName}</h3>
                  <p className="text-gray-600">{userProfile?.email}</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mt-2">
                    Job Applicant
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{userProfile?.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">+254 XXX XXX XXX</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">Nairobi, Kenya</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Account Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Member since:</span>
                      <p className="text-gray-700">{userProfile?.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Account type:</span>
                      <p className="text-gray-700 capitalize">{userProfile?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors mr-4">
                  Edit Profile
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Upload Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                <h3 className="font-semibold text-gray-900 mb-2">Job Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">{selectedJob.description}</p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Department:</strong> {selectedJob.department}</p>
                    <p><strong>Location:</strong> {selectedJob.location}</p>
                    <p><strong>Type:</strong> {selectedJob.type}</p>
                    <p><strong>Deadline:</strong> {selectedJob.deadline.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, resumeFile: e.target.files?.[0] || null }))}
                  />
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={!applicationForm.coverLetter.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
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