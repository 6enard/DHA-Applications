import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  Building, 
  DollarSign, 
  Search, 
  Filter, 
  Eye, 
  Send, 
  CheckCircle, 
  AlertCircle,
  X,
  Upload
} from 'lucide-react';
import { useEmailNotifications } from './EmailNotificationService';
import FileUploadService from './FileUploadService';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
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

interface JobBoardProps {
  onApply: (jobId: string) => void;
  appliedJobs: string[];
}

const JobBoard: React.FC<JobBoardProps> = ({ onApply, appliedJobs }) => {
  const { sendApplicationReceivedEmail } = useEmailNotifications();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Application form state
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'jobs');
      const q = query(
        jobsRef, 
        where('status', '==', 'active'),
        orderBy('postedAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: JobListing[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const job = {
            id: doc.id,
            ...data,
            deadline: data.deadline.toDate(),
            postedAt: data.postedAt.toDate()
          } as JobListing;
          
          // Only show jobs that haven't passed deadline
          if (job.deadline > new Date()) {
            jobsData.push(job);
          }
        });
        
        setJobs(jobsData);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load jobs');
      setLoading(false);
    }
  };

  const handleApplyForJob = async () => {
    if (!selectedJob || !applicationForm.fullName || !applicationForm.email || !applicationForm.coverLetter) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        applicantName: applicationForm.fullName,
        applicantEmail: applicationForm.email,
        applicantPhone: applicationForm.phone,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: applicationForm.coverLetter.trim(),
        notes: '',
        createdBy: 'public-applicant'
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // Send confirmation email
      await sendApplicationReceivedEmail(
        applicationForm.email,
        selectedJob.title,
        applicationForm.fullName
      );

      setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
      setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
      setUploadedFiles([]);
      setShowApplicationModal(false);
      onApply(selectedJob.id);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const isActive = job.status === 'active' && job.deadline > new Date();
    
    return matchesSearch && matchesDepartment && matchesType && matchesLocation && isActive;
  });

  const uniqueDepartments = Array.from(new Set(jobs.map(job => job.department)));
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Opportunities</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join Kenya's Digital Health Agency and help transform healthcare delivery through innovative technology solutions.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
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
            
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobs.includes(job.id);
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
                    Posted: {job.postedAt.toLocaleDateString()} | Deadline: {job.deadline.toLocaleDateString()}
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
                          setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
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
            <p className="text-gray-600">
              {jobs.length === 0 
                ? "No job opportunities are currently available. Check back later for new positions."
                : "Try adjusting your search criteria to find more opportunities."
              }
            </p>
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
                {!appliedJobs.includes(selectedJob.id) && (
                  <button
                    onClick={() => {
                      setShowJobModal(false);
                      setShowApplicationModal(true);
                      setApplicationForm({ fullName: '', email: '', phone: '', coverLetter: '' });
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
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleApplyForJob();
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.fullName}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={applicationForm.email}
                      onChange={(e) => setApplicationForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={applicationForm.phone}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter *
                  </label>
                  <textarea
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us why you're interested in this position and how your skills and experience make you a great fit..."
                    value={applicationForm.coverLetter}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {applicationForm.coverLetter.length}/1000 characters
                  </p>
                </div>
                
                <FileUploadService
                  onFileUpload={handleFileUpload}
                  acceptedTypes={['.pdf', '.doc', '.docx']}
                  maxFileSize={5}
                  maxFiles={3}
                  label="Supporting Documents"
                  description="Upload your resume, cover letter, certificates, and other relevant documents"
                />
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Application Information</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>Position: {selectedJob.title}</p>
                    <p>Department: {selectedJob.department}</p>
                    <p>Location: {selectedJob.location}</p>
                    <p>Application Deadline: {selectedJob.deadline.toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !applicationForm.fullName || !applicationForm.email || !applicationForm.coverLetter}
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
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoard;