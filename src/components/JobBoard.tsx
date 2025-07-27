import React, { useState, useEffect } from 'react';
import { Briefcase, Search } from 'lucide-react';
import { useEmailNotifications } from './EmailNotificationService';
import { useAuth } from '../contexts/AuthContext';
import AlertMessage from './common/AlertMessage';
import LoadingSpinner from './common/LoadingSpinner';
import JobCard from './jobs/JobCard';
import JobDetailsModal from './jobs/JobDetailsModal';
import Modal from './common/Modal';
import ApplicationForm from './jobs/ApplicationForm';
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
  const { currentUser, userProfile } = useAuth();
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

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, orderBy('postedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const jobsData: JobListing[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include active jobs
          if (data.status === 'active') {
            const job = {
              id: doc.id,
              ...data,
              deadline: data.deadline.toDate(),
              postedAt: data.postedAt.toDate()
            } as JobListing;
            
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

  const handleApplyForJob = async (formData: any) => {
    if (!selectedJob || !formData.fullName || !formData.email || !formData.coverLetter) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const applicationData = {
        applicantName: formData.fullName,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        department: selectedJob.department,
        status: 'submitted',
        stage: 'initial-review',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        coverLetter: formData.coverLetter.trim(),
        notes: '',
        createdBy: currentUser?.uid || 'public-applicant',
        applicantId: currentUser?.uid || null
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // Send confirmation email
      await sendApplicationReceivedEmail(
        formData.email,
        selectedJob.title,
        formData.fullName
      );

      setSuccess('Application submitted successfully! We will review your application and get back to you soon.');
      setShowApplicationModal(false);
      onApply(selectedJob.id);
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    const isActive = job.status === 'active';
    const notExpired = job.deadline > new Date();
    
    return matchesSearch && matchesDepartment && matchesType && matchesLocation && isActive && notExpired;
  });

  const uniqueDepartments = Array.from(new Set(jobs.map(job => job.department)));
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.location)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading job opportunities..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <AlertMessage type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <AlertMessage type="error" message={error} onClose={() => setError('')} />
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
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job opportunities...</p>
            </div>
          )}

          {!loading && jobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
              <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Job Opportunities Available</h3>
              <div className="max-w-md mx-auto space-y-3 text-gray-600">
                <p>We don't have any active job postings at the moment.</p>
                <p>New opportunities are posted regularly, so please check back soon!</p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Stay Updated</h4>
                  <p className="text-sm text-blue-800">
                    Follow our social media channels or subscribe to our newsletter to be notified when new positions become available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Match Your Criteria</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search filters to find more opportunities.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                    setTypeFilter('all');
                    setLocationFilter('all');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobs.includes(job.id);
            
            return (
              <JobCard
                key={job.id}
                job={job}
                hasApplied={hasApplied}
                onViewDetails={() => {
                  setSelectedJob(job);
                  setShowJobModal(true);
                }}
                onApply={() => {
                  setSelectedJob(job);
                  setShowApplicationModal(true);
                  setError('');
                }}
              />
            );
          })}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJob}
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
        onApply={() => {
          setShowJobModal(false);
          setShowApplicationModal(true);
          setError('');
        }}
        hasApplied={selectedJob ? appliedJobs.includes(selectedJob.id) : false}
      />

      {/* Application Modal */}
      <Modal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        title={selectedJob ? `Apply for ${selectedJob.title}` : 'Apply for Job'}
      >
        {selectedJob && (
          <ApplicationForm
            job={selectedJob}
            onSubmit={handleApplyForJob}
            onCancel={() => setShowApplicationModal(false)}
            submitting={submitting}
          />
        )}
      </Modal>
    </div>
  );
};

export default JobBoard;